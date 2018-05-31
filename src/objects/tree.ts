import Node     from '@components/node'
import IPLDNode from '@objects/ipld-node'
import { ipld } from '@objects/ipld-node'

@ipld('path')
@ipld('children', { link: true, type: 'map' })
class Tree extends IPLDNode {
  public path?:     string
  public children: object

  public constructor (data: any, opts?: any) {
    super('tree')
    this.path       = data.path || undefined
    this.children   = data.children || {}
  }
  
  public async put (node: Node) {
    let cid = await node.put(await this.toIPLD())
    for (let child in this.children) {
      await this.children[child].put(node)
    }
    return cid
  }
}

export default Tree