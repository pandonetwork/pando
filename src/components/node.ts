import Loom from '@components/loom'
import Pando from '@pando'
import * as utils from '@utils'
import CID from 'cids'
import IPFS from 'ipfs'
import IPFSRepo from 'ipfs-repo'
import memoryLock from 'ipfs-repo/src/lock-memory'
import IPLD from 'ipld'
import IPLDPando from 'ipld-pando'
import path from 'path'
import promisify from 'promisify-event'

const IPFSRepoOpts = {
  storageBackends: {
    root: require('datastore-fs'),
    blocks: require('datastore-fs'),
    keys: require('datastore-fs'),
    datastore: require('datastore-fs')
  },
  storageBackendOptions: {
    root: {
      extension: '.ipfsroot', // Defaults to ''. Used by datastore-fs; Appended to all files
      errorIfExists: false, // Used by datastore-fs; If the datastore exists, don't throw an error
      createIfMissing: true // Used by datastore-fs; If the datastore doesn't exist yet, create it
    },
    blocks: {
      sharding: false, // Used by IPFSRepo Blockstore to determine sharding; Ignored by datastore-fs
      extension: '.ipfsblock', // Defaults to '.data'.
      errorIfExists: false,
      createIfMissing: true
    },
    keys: {
      extension: '.ipfskey', // No extension by default
      errorIfExists: false,
      createIfMissing: true
    },
    datastore: {
      extension: '.ipfsds', // No extension by default
      errorIfExists: false,
      createIfMissing: true
    }
  },
  lock: memoryLock
}

export default class Node {
  public loom: Loom
  public ipfs: any
  public ipld: any

  public constructor(_loom: Loom, _ipfs: any, _ipld: any) {
    this.loom = _loom
    this.ipfs = _ipfs
    this.ipld = _ipld
  }

  public static async new(_loom: Loom): Promise<Node> {
    const repo = new IPFSRepo(_loom.paths.ipfs, IPFSRepoOpts)
    const ipfs = new IPFS({ repo, start: false })

    await promisify(ipfs, 'ready')
    const ipld = new IPLD(ipfs.block)

    // Replace raw-format resolver by pando-format resolver until
    // pando-format is registered in the multiformat table
    ipld.support.rm('raw')
    ipld.support.add('raw', IPLDPando.resolver, IPLDPando.util)

    return new Node(_loom, ipfs, ipld)
  }

  public static async load(_loom: Loom): Promise<Node> {
    const repo = new IPFSRepo(_loom.paths.ipfs, IPFSRepoOpts)
    const ipfs = new IPFS({ repo, init: false, start: false })
    await promisify(ipfs, 'ready')
    const ipld = new IPLD(ipfs.block)

    // Replace raw-format resolver by pando-format resolver until
    // pando-format is registered in the multiformat table
    ipld.support.rm('raw')
    ipld.support.add('raw', IPLDPando.resolver, IPLDPando.util)

    return new Node(_loom, ipfs, ipld)
  }

  public async upload(_path: string): Promise<string> {
    const results = await this.ipfs.files.add([
      {
        path: path.relative(this.loom.paths.root, _path),
        content: utils.fs.read(_path)
      }
    ])
    return results[0].hash
  }

  public async download(_cid: any, opts?: any) {
    return new Promise<any>(async (resolve, reject) => {
      const cid = CID.isCID(_cid) ? _cid : new CID(_cid)
      this.ipld.get(cid, async (err, result) => {
        if (err) {
          reject(err)
        } else {
          const node = result.value
          const nodePath = path.join(this.loom.paths.root, node.path)

          if (node['@type'] === 'tree') {
            if (!utils.fs.exists(nodePath)) {
              utils.fs.mkdir(nodePath)
            }

            delete node['@type']
            delete node.path

            for (const entry in node) {
              this.download(node[entry]['/'])
            }
          } else if (node['@type'] === 'file') {
            const buffer = await this.ipfs.files.cat(node.link['/'])
            utils.fs.write(nodePath, buffer)
          }
          resolve(true)
        }
      })
    })
  }

  public async put(object: any): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.ipld.put(
        object,
        { format: 'raw', hashAlg: 'keccak-256' },
        async (err, cid) => {
          if (err) {
            reject(err)
          } else {
            resolve(cid)
          }
        }
      )
    })
  }

  public async get(_cid: any, _path?: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      const cid = CID.isCID(_cid) ? _cid : new CID(_cid)
      this.ipld.get(cid, _path || '', async (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result.value)
        }
      })
    })
  }

  public async cid(_data, opts: any) {
    if (opts.file) {
      const file = [
        {
          path: path.relative(this.loom.paths.root, _data),
          content: utils.fs.read(_data)
        }
      ]
      const results = await this.ipfs.files.add(file, { 'only-hash': true })
      return results[0].hash
    }
  }
}
