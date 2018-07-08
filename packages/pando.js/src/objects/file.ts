import Node from '../components/node'
import IPLDNode from './ipld-node'

class File extends IPLDNode {
  public path?: string
  public link: string

  public constructor(data: any, opts?: any) {
    super('file')
    this.path = data.path || undefined
    this.link = data.link
  }

  public async toIPLD(): Promise<any> {
    const node: any = {}

    node['@type'] = this.type
    node.path = this.path
    node.link = { '/': this.link }

    return node
  }

  public async put(node: Node) {
    const ipldNode = await this.toIPLD()
    const cid = await node.put(ipldNode)
    return cid.toBaseEncodedString()
  }

  // public async push(node: any): Promise<string> {
  //   await node.uploadToGateway(this.link, this.path)
  //   const cid = await node.gateway.dag.put(await this.toIPLD(), {
  //     format: 'dag-cbor',
  //     hashAlg: 'keccak-256'
  //   })
  //
  //   return cid.toBaseEncodedString()
  // }
}

export default File
