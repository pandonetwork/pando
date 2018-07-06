import Node from '@components/node'
import IPLDNode from '@objects/ipld-node'

class Tree extends IPLDNode {
  public path?: string
  public children: object

  public constructor(data: any, opts?: any) {
    super('tree')
    this.path = data.path || undefined
    this.children = data.children || {}
  }

  public async toIPLD(): Promise<any> {
    const node: any = {}

    node['@type'] = this.type
    node.path = this.path

    for (const child in this.children) {
      if (this.children.hasOwnProperty(child)) {
        const cid = await this.children[child].cid()
        node[child] = {
          '/': cid.toBaseEncodedString()
        }
      }
    }

    return node
  }

  public async put(node: Node) {
    const ipldNode = await this.toIPLD()
    const cid = await node.put(ipldNode)
    for (const child in this.children) {
      if (this.children.hasOwnProperty(child)) {
        await this.children[child].put(node)
      }
    }
    return cid
  }

  // public async push(node: any): Promise<string> {
  //   for (const child in this.children) {
  //     if (this.children.hasOwnProperty(child)) {
  //       await this.children[child].push(node)
  //     }
  //   }
  //
  //   const cid = await node.gateway.dag.put(await this.toIPLD(), {
  //     format: 'dag-cbor',
  //     hashAlg: 'keccak-256'
  //   })
  //
  //   return cid.toBaseEncodedString()
  // }
}

export default Tree
