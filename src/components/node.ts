import Repository from '@components/repository'
import Pando from '@pando'
import * as utils from '@utils'
import CID from 'cids'
import IPFS from 'ipfs'
import IPFSRepo from 'ipfs-repo'
import memoryLock from 'ipfs-repo/src/lock-memory'
import IPLD from 'ipld'
import IPLDPando from 'ipld-pando'
import npath from 'path'
import promisify from 'promisify-event'

/* tslint:disable:object-literal-sort-keys */
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
/* tslint:enable:object-literal-sort-keys */

export default class Node {
  public static async create(repository: Repository): Promise<Node> {
    const IPFSRepository = new IPFSRepo(repository.paths.ipfs, IPFSRepoOpts)
    const ipfs = new IPFS({ repo: IPFSRepository, start: false })

    await promisify(ipfs, 'ready')
    const ipld = new IPLD(ipfs.block)

    // Replace raw-format resolver by pando-format resolver until
    // pando-format is registered in the multiformat table
    ipld.support.rm('raw')
    ipld.support.add('raw', IPLDPando.resolver, IPLDPando.util)

    return new Node(repository, ipfs, ipld)
  }

  public static async load(repository: Repository): Promise<Node> {
    const IPFSRepository = new IPFSRepo(repository.paths.ipfs, IPFSRepoOpts)
    const ipfs = new IPFS({ repo: IPFSRepository, init: false, start: false })
    await promisify(ipfs, 'ready')
    const ipld = new IPLD(ipfs.block)

    // Replace raw-format resolver by pando-format resolver until
    // pando-format is registered in the multiformat table
    ipld.support.rm('raw')
    ipld.support.add('raw', IPLDPando.resolver, IPLDPando.util)

    return new Node(repository, ipfs, ipld)
  }

  public repository: Repository
  public ipfs: any
  public ipld: any

  public constructor(repository: Repository, ipfs: any, ipld: any) {
    this.repository = repository
    this.ipfs = ipfs
    this.ipld = ipld
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

  public async download(cid: any, opts?: any) {
    return new Promise<any>(async (resolve, reject) => {
      cid = CID.isCID(cid) ? cid : new CID(cid)
      this.ipld.get(cid, async (err, result) => {
        if (err) {
          reject(err)
        } else {
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
                this.download(node[entry]['/'])
              }
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

  public async get(cid: any, path?: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      cid = CID.isCID(cid) ? cid : new CID(cid)
      this.ipld.get(cid, path || '', async (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result.value)
        }
      })
    })
  }

  public async cid(data, opts: any) {
    if (opts.file) {
      const file = [
        {
          content: utils.fs.read(data),
          path: npath.relative(this.repository.paths.root, data)
        }
      ]
      const results = await this.ipfs.files.add(file, { 'only-hash': true })
      return results[0].hash
    }
  }
}
