import IPLD from 'ipld'
import Pando0x from '@pando0x'
import CID from 'cids'


export default class Satellizer {
    
  public ipfs: any
  public ipld: any
  
  public constructor (_ipfs: any) {
    this.ipfs = _ipfs
    this.ipld = new IPLD(this.ipfs.block)
  }
  
  public async put (object: any): Promise < any > {
    return new Promise < any > (async (resolve, reject) => {
      await this.ipfs.start()
      let opts = { format: 'dag-cbor', hashAlg: 'sha2-256' }
      this.ipld.put(object, opts, async (err, cid) => {
        await this.ipfs.stop()
        if(err) {
          reject(err)
        } else {
          resolve(cid)
        }
      })
    })
  }
  
  public async get (cid: string): Promise < any > {
    console.log(cid)
    return new Promise < any > (async (resolve, reject) => {
      // await this.ipfs.start()
      // let opts = { format: 'dag-cbor', hashAlg: 'sha2-256' }
      this.ipld.get(new CID(cid), '',(err, result) => {
        if (err) {
          console.log('TTT')
          reject(err)
        } else {
          console.log('sattellizer')
          resolve(result.value)
        }
      })
    })
  }

}
  