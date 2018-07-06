import IPLDNode from '@objects/ipld-node'
import { ipld } from '@objects/ipld-node'
import Tree from '@objects/tree'

@ipld('timestamp')
@ipld('author')
@ipld('message')
@ipld('parents', { link: true, type: 'array' })
@ipld('tree', { link: true })
class Snapshot extends IPLDNode {
  // public static async fromCID(cid: string, repository: any): Promise<Snapshot> {
  //   const snapshot = await repository.fromIPLD(await repository.node!.get(cid))
  //   return snapshot
  // }

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

  public async push(node: any): Promise<string> {
    await this.tree.push(node)

    for (const parent of this.parents) {
      await parent.push(node)
    }

    const cid = await node.gateway.dag.put(await this.toIPLD(), {
      format: 'dag-cbor',
      hashAlg: 'keccak-256'
    })

    return cid.toBaseEncodedString()
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
}

export default Snapshot
