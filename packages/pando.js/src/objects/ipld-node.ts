import register from 'module-alias/register'

import DAG from 'ipld-dag-cbor'
import { promisify } from 'util'

export default abstract class IPLDNode {
  public type: string

  public constructor(type: string) {
    this.type = type
  }

  public async cid(): Promise<any> {
    const ipldNode = await this.toIPLD()
    const cid = await promisify(DAG.util.cid)(ipldNode, {
      format: 'dag-cbor',
      hashAlg: 'keccak-256'
    })
    return cid
  }

  public abstract async toIPLD(): Promise<any>
}
