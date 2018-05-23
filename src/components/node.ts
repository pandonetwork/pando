import Pando        from '@pando'
import Loom         from '@components/loom'
import * as utils   from '@locals/utils'
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
    let ipfs = new IPFS({ repo: _loom.paths.ipfs })
    ipfs.on('error', (err) => { throw err })
    await promisify(ipfs, 'ready')
    let ipld = new IPLD(ipfs.block)
    await ipfs.stop()
    
    return new Node(_loom, ipfs, ipld)
  }
  
  public async upload (_path: string): Promise < string > {
    let results = await this.ipfs.files.add([{ path: path.relative(this.loom.paths.root, _path), content: utils.fs.read(_path) }])
    
    return results[0].hash
  }
  
  public async structureAndUpload ()
  let index: any = this.index
  
  for (let entry of tree) {
    
    if(index[entry.path]) { // entry is a file
      
      index[entry.path].repo = index[entry.path].stage
      
      this.index = index
      
      return { path: entry.path, cid: index[entry.path].stage }
    
    } else { // entry is a tree node
      
      let node = {}

      for (let child of entry.children) {
        let link = await this.pushTree([child])
        node = { ...node, [path.basename(link.path)]: { 'link': { '/': link.cid } } }
      }
      
      let cid = await this.satellizer.put(node)
      
      return { path: entry.path, cid: cid }
    
    }
    
  }
  
  
  // public async put (object: any): Promise < any > {
  // 
  // 
  // 
  //   return new Promise < any > (async (resolve, reject) => {
  //     await this.ipfs.start()
  //     let opts = { format: 'dag-cbor', hashAlg: 'keccak-256' }
  //     this.ipld.put(object, opts, async (err, cid) => {
  //       await this.ipfs.stop()
  //       if(err) {
  //         reject(err)
  //       } else {
  //         resolve(cid.toBaseEncodedString())
  //       }
  //     })
  //   })
  // }
  // 
  // public async get (cid: string): Promise < any > {
  //   console.log(cid)
  //   return new Promise < any > (async (resolve, reject) => {
  //     await this.ipfs.start()
  //     this.ipld.get(new CID(cid), '', async (err, result) => {
  //       await this.ipfs.stop()
  //       if (err) {
  //         reject(err)
  //       } else {
  //         resolve(result.value)
  //       }
  //     })
  //   })
  // }
  
  // For files
  public async download () {
    
  }
  
  // For IPLD objects
  public async put () {
    
  }
  
  // For 
  public async get () {
    
  }
  
  public async cid (_data, opts: any) {
    if (opts.file) {
      let file = [{ path: path.relative(this.loom.paths.root, _data), content: utils.fs.read(_data) }]
      let results = await this.ipfs.files.add(file, { 'only-hash': true })
      return results[0].hash        
    }
  }
  

}
  