import IPLDNode from '@objects/ipld-node'
import { ipld } from '@objects/ipld-node'
import Tree     from '@objects/tree'


@ipld('timestamp')
@ipld('author')
@ipld('message')
@ipld('parents', { link: true, type: 'array' })
@ipld('tree', { link: true })
class Snapshot extends IPLDNode {
  public timestamp: number
  public parents:   Snapshot[]
  public tree:      Tree
  public author:    object
  public message:   string
  
  public constructor (data: any, opts?: any) {
    super('snapshot')
    this.author     = data.author
    this.tree       = data.tree
    this.parents    = data.parents || []
    this.message    = data.message
    this.timestamp  = data.timestamp || Date.now()
  }
}

export default Snapshot