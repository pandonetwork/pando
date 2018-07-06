import Repository from '@components/repository'
import RemoteBranchFactory from '@factories/remote-branch-factory'
import CID from 'cids'
import { hash } from 'eth-ens-namehash'
import ethereumRegex from 'ethereum-regex'
import IPFS from 'ipfs-api'
import { keccak256, sha3_256 } from 'js-sha3'
import util from 'util'
import web3Utils from 'web3-utils'

export default class Remote {
  public static APP_NAMESPACE = '0x' + keccak256('app')
  public static APP_BASE_NAMESPACE = '0x' + keccak256('base')
  public static TREE_BASE_APP_ID = hash('tree.pando.aragonpm.test')
  public static TREE_APP_ID = web3Utils.sha3(
    Remote.APP_BASE_NAMESPACE + Remote.TREE_BASE_APP_ID.substring(2),
    { encoding: 'hex' }
  )
  public static PROXY_APP_ID = web3Utils.sha3(
    Remote.APP_NAMESPACE + Remote.TREE_BASE_APP_ID.substring(2),
    { encoding: 'hex' }
  )

  public static async at(
    repository: Repository,
    kernelAddress: string
  ): Promise<any> {
    const kernel = await repository.pando.contracts.kernel.at(kernelAddress)
    const acl = await repository.pando.contracts.acl.at(await kernel.acl())
    let address = await kernel.getApp(Remote.TREE_APP_ID)
    let address2 = await kernel.getApp(Remote.PROXY_APP_ID)
    const tree = await repository.pando.contracts.tree.at(
      await kernel.getApp(Remote.PROXY_APP_ID)
    )

    return { kernel, acl, tree }
  }

  public repository: Repository
  public name: string
  public kernel: any
  public acl?: any
  public tree?: any
  public branches = new RemoteBranchFactory(this)

  public constructor(
    repository: Repository,
    kernel: any,
    acl: any,
    tree: any,
    name: string
  ) {
    this.repository = repository
    this.name = name
    this.kernel = kernel
    this.acl = acl
    this.tree = tree
  }

  public async push(branch: string, cid: string): Promise<any> {
    const PUSH = await this.tree.PUSH()
    const PERM = await this.acl.hasPermission(
      this.repository.config.author.account,
      this.tree.address,
      PUSH
    )
    if (!this.repository.branches.exists(branch, { remote: this.name })) {
      throw new Error(
        "Branch '" + this.name + ':' + branch + "' does not exist'"
      )
    }
    if (!CID.isCID(new CID(cid))) {
      throw new Error('CID ' + cid + ' is not valid')
    }
    if (!PERM) {
      throw new Error(
        "You do not own PUSH role over remote '" + this.name + "'"
      )
    }

    const branchHash = '0x' + keccak256(branch)
    const receipt = await this.tree.setHead(branch, cid, {
      from: this.repository.config.author.account
    })

    // const node = IPFS({
    //   host: '178.128.202.49',
    //   port: 8080,
    //   protocol: 'http'
    // })

    // const node = IPFS({
    //   host: 'ipfs.infura.io',
    //   port: 5001,
    //   protocol: 'https'
    // })

    // const node = IPFS('ipfs.infura.io', '5001', { protocol: 'https' })

    // const node = IPFS('178.128.202.49', '8002', { protocol: 'http' })

    // const message = Buffer.from('toto')
    //
    // const pin = util.promisify(node.pin.add)
    // await this.repository.node!.ipfs.start()
    // await pin(cid)
    // await this.repository.node!.ipfs.start()
    // node.pin.add(cid, (err, res) => {
    //   if (err) {
    //     console.log(err)
    //   } else {
    //     console.log(res)
    //   }
    // })

    return receipt
  }

  public async head(branch: string): Promise<any> {
    if (!this.repository.branches.exists(branch, { remote: this.name })) {
      throw new Error(
        "Branch '" + this.name + ':' + branch + "' does not exist'"
      )
    }
    const head = await this.tree.getHead(branch)

    return head
  }

  public async fetch(): Promise<any> {
    const branches = await this.branches.list()
    const heads = {}
    for (const branchName of branches) {
      const head = await this.head(branchName)

      const branch = await this.repository.branches.load(branchName, {
        remote: this.name
      })
      branch.head = head
      heads[branchName] = await this.head(branchName)
    }

    return heads
  }

  public async show(): Promise<any> {
    const branches = await this.branches.list()
    const remote = {
      acl: this.acl.address,
      branches: {},
      kernel: this.kernel.address,
      tree: this.tree.address
    }

    for (const branch of branches) {
      remote.branches[branch] = { head: await this.head(branch) }
    }

    return remote
  }

  public async grant(what: string, who: string): Promise<any> {
    let receipt

    if (!ethereumRegex({ exact: true }).test(who)) {
      throw new TypeError("'" + who + "' is not a valid ethereum address")
    }

    switch (what) {
      case 'PUSH':
        const PUSH = await this.tree.PUSH()
        receipt = await this.acl.grantPermission(who, this.tree.address, PUSH, {
          from: this.repository.config.author.account
        })
        break
      default:
        throw new TypeError("'" + what + "' is not a valid role")
    }

    return receipt
  }
}
