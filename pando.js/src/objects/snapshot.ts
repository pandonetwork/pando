import Node from '../components/node'
import IPLDNode from './ipld-node'
import Tree from './tree'

class Snapshot extends IPLDNode {
  public timestamp: number
  public parents: Snapshot[]
  public tree: Tree
  public author: object
  public message: string

  public constructor(data: any, opts?: any) {
    super('snapshot')
    this.author = data.author
    this.tree = data.tree
    this.parents = data.parents || []
    this.message = data.message
    this.timestamp = data.timestamp || Date.now()
  }

  public async toIPLD(): Promise<any> {
    const node: any = {}

    node['@type'] = this.type
    node.timestamp = this.timestamp
    node.author = this.author
    node.message = this.message
    node.tree = { '/': (await this.tree.cid()).toBaseEncodedString() }
    node.parents = []

    for (const parent of this.parents) {
      node.parents.push({ '/': (await parent.cid()).toBaseEncodedString() })
    }

    return node
  }

  public async put(node: Node): Promise<string> {
    const ipldNode = await this.toIPLD()
    await this.tree.put(node)
    for (const parent of this.parents) {
      await parent.put(node)
    }
    const cid = await node.put(ipldNode)

    return cid.toBaseEncodedString()
  }
}

export default Snapshot
