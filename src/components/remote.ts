import Repository from '@components/repository'
import RemoteBranchFactory from '@factories/remote-branch-factory'
import CID from 'cids'
import { hash } from 'eth-ens-namehash'
import ethereumRegex from 'ethereum-regex'
import { keccak256, sha3_256 } from 'js-sha3'
import web3Utils from 'web3-utils'

export default class Remote {
  public static APP_BASE_NAMESPACE = '0x' + keccak256('base')
  public static TREE_BASE_APP_ID = hash('tree.pando.aragonpm.test')
  public static TREE_APP_ID = web3Utils.sha3(
    Remote.APP_BASE_NAMESPACE + Remote.TREE_BASE_APP_ID.substring(2),
    { encoding: 'hex' }
  )

  public static async at(
    repository: Repository,
    kernelAddress: string
  ): Promise<any> {
    const kernel = await repository.pando.contracts.kernel.at(kernelAddress)
    const acl = await repository.pando.contracts.acl.at(await kernel.acl())
    const tree = await repository.pando.contracts.tree.at(
      await kernel.getApp(Remote.TREE_APP_ID)
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
    if (!this.repository.branches.exists(branch, { remote: this.name })) {
      throw new Error(
        "Branch '" + this.name + ':' + branch + "' does not exist'"
      )
    }
    if (!CID.isCID(new CID(cid))) {
      throw new Error('CID ' + cid + ' is not valid')
    }

    const branchHash = '0x' + keccak256(branch)
    const receipt = await this.tree.setHead(branch, cid)

    return receipt
  }

  public async head(branch: string): Promise<any> {
    if (!this.repository.branches.exists(branch, { remote: this.name })) {
      throw new Error(
        "Branch '" + this.name + ':' + branch + "' does not exist'"
      )
    }

    const branchHash = '0x' + keccak256(branch)
    const head = await this.tree.getHead(branchHash)

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
      throw new TypeError('Invalid ethereum address: ' + who)
    }

    switch (what) {
      case 'PUSH':
        const PUSH = await this.tree.PUSH()
        receipt = await this.acl.grantPermission(who, this.tree.address, PUSH)
        break
      default:
        throw new TypeError('Invalid role: ' + what)
    }

    return receipt
  }
}
