import Pando        from '@pando'
import Loom         from '@components/loom'
import * as utils   from '@locals/utils'
import IPFS         from 'ipfs'
import IPFSRepo     from 'ipfs-repo'
import memoryLock   from 'ipfs-repo/src/lock-memory' 
import IPLD         from 'ipld'
import IPLDPando    from 'ipld-pando'
import CID          from 'cids'
import promisify    from 'promisify-event'
import path         from 'path'


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

  public constructor (_loom: Loom, _ipfs: any, _ipld: any) {
    this.loom = _loom
    this.ipfs = _ipfs
    this.ipld = _ipld
  }

  public static async new (_loom: Loom): Promise < Node > {
    let repo = new IPFSRepo(_loom.paths.ipfs, IPFSRepoOpts)
    let ipfs = new IPFS({ repo: repo, start: false })
  
    await promisify(ipfs, 'ready')
    let ipld = new IPLD(ipfs.block)

    // Replace raw-format resolver by pando-format resolver until
    // pando-format is registered in the multiformat table
    ipld.support.rm('raw')
    ipld.support.add('raw', IPLDPando.resolver, IPLDPando.util)

    return new Node(_loom, ipfs, ipld)
  }

  public static async load (_loom: Loom): Promise < Node > {
    let repo = new IPFSRepo(_loom.paths.ipfs, IPFSRepoOpts)
    let ipfs = new IPFS({ repo: repo, init: false, start: false })
    await promisify(ipfs, 'ready')
    let ipld = new IPLD(ipfs.block)

    // Replace raw-format resolver by pando-format resolver until
    // pando-format is registered in the multiformat table
    ipld.support.rm('raw')
    ipld.support.add('raw', IPLDPando.resolver, IPLDPando.util)

    return new Node(_loom, ipfs, ipld)
  }

  public async upload (_path: string): Promise < string > {
    let results = await this.ipfs.files.add([{ path: path.relative(this.loom.paths.root, _path), content: utils.fs.read(_path) }])
    return results[0].hash
  }

  public async download (_cid: any, opts?: any) {
    return new Promise < any > (async (resolve, reject) => {
      let cid = CID.isCID(_cid) ? _cid : new CID(_cid)
      this.ipld.get(cid, async (err, result) => {
        if (err) {
          reject(err)
        } else {
          let node = result.value
          let nodePath = path.join(this.loom.paths.root, node.path)
          
          if (node['@type'] === 'tree') {
            if (!utils.fs.exists(nodePath)) { utils.fs.mkdir(nodePath) }
            
            delete node['@type']
            delete node['path']
            
            for (let entry in node) {
              this.download(node[entry]['/'])
            }
          } else if (node['@type'] === 'file') {
            let buffer = await this.ipfs.files.cat(node.link['/'])
            utils.fs.write(nodePath, buffer)
            
          }
          resolve(true)
        }
      })
    })
  }

  public async put (object: any): Promise < any > {
    return new Promise < any > (async (resolve, reject) => {
      this.ipld.put(object, { format: 'raw', hashAlg: 'keccak-256'}, async (err, cid) => {
        if(err) {
          reject(err)
        } else {
          resolve(cid)
        }
      })
    })
  }

  public async get (_cid: any, _path?: string): Promise < any > {
    return new Promise < any > (async (resolve, reject) => {
      let cid = CID.isCID(_cid) ? _cid : new CID(_cid)
      this.ipld.get(cid, _path || '', async (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result.value)
        }
      })
    })
  }

  public async cid (_data, opts: any) {
    if (opts.file) {
      let file = [{ path: path.relative(this.loom.paths.root, _data), content: utils.fs.read(_data) }]
      let results = await this.ipfs.files.add(file, { 'only-hash': true })
      return results[0].hash
    }
  }
}
