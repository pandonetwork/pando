import Snapshot      from '@objects/snapshot'
import IPLDPando     from 'ipld-pando'
import "reflect-metadata"
import { promisify } from 'util'

function ipld(attribute, opts?) {
  opts = opts || {}
  return function(constructor) {
    const iplds = Reflect.getMetadata('ipld', constructor) || {}
    iplds[attribute] = opts
    return Reflect.defineMetadata('ipld', iplds, constructor)
  }
}

class IPLDNode {  
  public type: string
  
  public constructor (type: string) {
    this.type = type
  }
  
  public async cid (): Promise < any > {
    const cid = await promisify(IPLDPando.util.cid)(await this.toIPLD())
    return cid
  }
  
  public async toIPLD () {
    const ipld = {}
    ipld['@type'] = this.type
    const attributes = Reflect.getMetadata('ipld', this.constructor.prototype.constructor) || []
    
    for (const attribute in attributes) {
      if (attributes[attribute].link) {
        const type = attributes[attribute].type
        switch (type) {
          case 'map':
            for (const child in this[attribute]) {
              ipld[child] = { '/': (await this[attribute][child].cid()).toBaseEncodedString() }
            }
            break
          case 'array':
            ipld[attribute] = []
            for (const child of this[attribute]) {
              ipld[attribute].push({ '/': (await child.cid()).toBaseEncodedString() })
            }
            break
          case 'direct':
            ipld[attribute] = { '/': this[attribute] }
            break
          default:
            ipld[attribute] = { '/': (await this[attribute].cid()).toBaseEncodedString() }
        }
      }
      else {
        ipld[attribute] = this[attribute]
      }
    }
    
    return ipld
  }
}

export default IPLDNode
export { ipld }
