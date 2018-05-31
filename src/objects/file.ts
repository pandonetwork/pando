import Node     from '@components/node'
import IPLDNode from '@objects/ipld-node'
import { ipld } from '@objects/ipld-node'

@ipld('path')
@ipld('link', { link: true, type: 'direct' })
class File extends IPLDNode {
  public path?: string
  public link: string

  public constructor (data: any, opts?: any) {
    super('file')
    this.path = data.path || undefined
    this.link = data.link
  }
  
  public async put (node: Node) {
    let cid = await node.put(await this.toIPLD())  
    return cid
  }
}

export default File
