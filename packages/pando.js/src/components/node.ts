import register from 'module-alias/register'

import Repository from '@components/repository'
import Pando from '@root'
import * as utils from '@utils'
import CID from 'cids'
import IPFS from 'ipfs-api'
import DAG from 'ipld-dag-cbor'
import npath from 'path'
import promisify from 'promisify-event'
import parseURL from 'url-parse'
import util from 'util'

export default class Node {
  public static async create(repository: Repository): Promise<Node> {
    const url = parseURL(repository.config.ipfs.gateway, true)
    const ipfs = IPFS(url.hostname, url.port, {
      protocol: url.protocol.slice(0, -1)
    })
    return new Node(repository, ipfs)
  }

  public static async load(repository: Repository): Promise<Node> {
    const url = parseURL(repository.config.ipfs.gateway, true)
    const ipfs = IPFS(url.hostname, url.port, {
      protocol: url.protocol.slice(0, -1)
    })
    return new Node(repository, ipfs)
  }

  public repository: Repository
  public ipfs: any

  public constructor(repository: Repository, ipfs: any) {
    this.repository = repository
    this.ipfs = ipfs
  }

  public async upload(path: string): Promise<string> {
    const results = await this.ipfs.files.add([
      {
        content: utils.fs.read(path),
        path: npath.relative(this.repository.paths.root, path)
      }
    ])
    return results[0].hash
  }

  public async download(cid: any, path?: string) {
    path = path || ''
    cid = CID.isCID(cid) ? cid : new CID(cid)

    const result = await this.ipfs.dag.get(cid, path)
    const node = result.value
    const nodePath = npath.join(this.repository.paths.root, node.path)

    if (node['@type'] === 'tree') {
      if (!utils.fs.exists(nodePath)) {
        utils.fs.mkdir(nodePath)
      }

      delete node['@type']
      delete node.path

      for (const entry in node) {
        if (node.hasOwnProperty(entry)) {
          await this.download(cid, path + '/' + entry)
        }
      }
    } else if (node['@type'] === 'file') {
      const buffer = await this.ipfs.files.cat(
        cid.toBaseEncodedString() + '/' + path + '/link'
      )
      utils.fs.write(nodePath, buffer)
    }

    return
  }

  public async put(object: any): Promise<any> {
    const cid = await this.ipfs.dag.put(object, {
      format: 'dag-cbor',
      hashAlg: 'keccak-256'
    })

    return cid
  }

  public async get(cid: any, path?: string): Promise<any> {
    cid = CID.isCID(cid) ? cid : new CID(cid)
    path = path || ''

    const result = await this.ipfs.dag.get(cid, path)

    return result.value
  }

  public async cid(data, opts?: any) {
    if (opts && opts.file) {
      const file = [
        {
          content: utils.fs.read(data),
          path: npath.relative(this.repository.paths.root, data)
        }
      ]
      const results = await this.ipfs.files.add(file, { 'only-hash': true })
      return results[0].hash
    } else {
      const hash = await this.ipfs.dag.put(data, {
        format: 'dag-cbor',
        hashAlg: 'keccak-256'
      })
      return hash.toBaseEncodedString()
    }
  }
}
