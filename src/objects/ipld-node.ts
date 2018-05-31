import IPLDPando     from 'ipld-pando'
import Snapshot      from '@objects/snapshot'
import { promisify } from 'util'
import "reflect-metadata"

function ipld(attribute, opts?) {
  opts = opts || {}
  return function(constructor) {
    let iplds = Reflect.getMetadata('ipld', constructor) || {}
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
    let cid = await promisify(IPLDPando.util.cid)(await this.toIPLD())
    return cid
  }
  
  public async toIPLD () {
    let ipld = {}
    ipld['@type'] = this.type
    let attributes = Reflect.getMetadata('ipld', this.constructor.prototype.constructor) || []
    
    for (let attribute in attributes) {
      if (attributes[attribute].link) {
        let type = attributes[attribute].type
        switch (type) {
          case 'map':
            for (let child in this[attribute]) {
              ipld[child] = { '/': (await this[attribute][child].cid()).toBaseEncodedString() }
            }
            break
          case 'array':
            ipld[attribute] = []
            for (let child of this[attribute]) {
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
