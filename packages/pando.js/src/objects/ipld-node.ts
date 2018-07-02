import Snapshot from '@objects/snapshot'
import IPLDPando from 'ipld-pando'
import 'reflect-metadata'
import { promisify } from 'util'

const ipld = (attribute, opts?) => {
  opts = opts || {}
  return constructor => {
    const iplds = Reflect.getMetadata('ipld', constructor) || {}
    iplds[attribute] = opts
    return Reflect.defineMetadata('ipld', iplds, constructor)
  }
}

class IPLDNode {
  public type: string

  public constructor(type: string) {
    this.type = type
  }

  public async cid(): Promise<any> {
    const cid = await promisify(IPLDPando.util.cid)(await this.toIPLD())
    return cid
  }

  public async toIPLD() {
    const ipldNode = {}
    ipldNode['@type'] = this.type
    const attributes =
      Reflect.getMetadata('ipld', this.constructor.prototype.constructor) || []

    for (const attribute in attributes) {
      if (attributes[attribute].link) {
        const type = attributes[attribute].type
        switch (type) {
          case 'map':
            for (const child in this[attribute]) {
              if (this[attribute].hasOwnProperty(child)) {
                ipldNode[child] = {
                  '/': (await this[attribute][
                    child
                  ].cid()).toBaseEncodedString()
                }
              }
            }
            break
          case 'array':
            ipldNode[attribute] = []
            for (const child of this[attribute]) {
              ipldNode[attribute].push({
                '/': (await child.cid()).toBaseEncodedString()
              })
            }
            break
          case 'direct':
            ipldNode[attribute] = { '/': this[attribute] }
            break
          default:
            ipldNode[attribute] = {
              '/': (await this[attribute].cid()).toBaseEncodedString()
            }
        }
      } else {
        ipldNode[attribute] = this[attribute]
      }
    }

    return ipldNode
  }
}

export default IPLDNode
export { ipld }
