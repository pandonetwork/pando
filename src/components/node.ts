import Pando        from '@pando'
import Loom         from '@components/loom'
import * as utils   from '@locals/utils'
import IPLDPando    from 'ipld-pando'
import IPFS         from 'ipfs'
import IPLD         from 'ipld'
import CID          from 'cids'
import promisify    from 'promisify-event'
import path         from 'path'

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
    let ipfs = new IPFS({ repo: _loom.paths.ipfs, EXPERIMENTAL: { sharding: true } })
    ipfs.on('error', (err) => { throw err })
    await promisify(ipfs, 'ready')
    let ipld = new IPLD(ipfs.block)
    await ipfs.stop()

    // Replace raw-format resolver by pando-format resolver until
    // pando-format is registered in the multiformat table
    ipld.support.rm('raw')
    ipld.support.add('raw', IPLDPando.resolver, IPLDPando.util)

    return new Node(_loom, ipfs, ipld)
  }

  public static async load (_loom: Loom): Promise < Node > {
    let ipfs = new IPFS({ repo: _loom.paths.ipfs, init: false })
    ipfs.on('error', (err) => { throw err })
    await promisify(ipfs, 'ready')
    let ipld = new IPLD(ipfs.block)
    await ipfs.stop()

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
