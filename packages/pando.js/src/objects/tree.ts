import Node from '@components/node'
import IPLDNode from '@objects/ipld-node'
import { ipld } from '@objects/ipld-node'

@ipld('path')
@ipld('children', { link: true, type: 'map' })
class Tree extends IPLDNode {
  public static async get(node: Node, cid: string) {
    const tree = await node.get(cid, 'tree')
    return tree
  }

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
    const cid = await node.put(await this.toIPLD())
    await node.gateway.dag.put(await this.toIPLD(), {
      format: 'dag-cbor',
      hashAlg: 'keccak-256'
    })
    for (const child in this.children) {
      if (this.children.hasOwnProperty(child)) {
        await this.children[child].put(node)
      }
    }
    return cid
  }

  public async push(node: any): Promise<string> {
    for (const child in this.children) {
      if (this.children.hasOwnProperty(child)) {
        await this.children[child].push(node)
      }
    }

    const cid = await node.gateway.dag.put(await this.toIPLD(), {
      format: 'dag-cbor',
      hashAlg: 'keccak-256'
    })

    return cid.toBaseEncodedString()
  }
}

export default Tree
