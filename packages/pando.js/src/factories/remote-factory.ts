import Remote from '@components/remote'
import Repository from '@components/repository'
import * as utils from '@utils'
import npath from 'path'

export default class RemoteFactory {
  public repository: Repository

  public constructor(repository: Repository) {
    this.repository = repository
  }

  public async deploy(name: string): Promise<Remote> {
    if (this.exists(name)) {
      throw new Error("Remote '" + name + "' already exists")
    }
    // Deploy base contracts
    const kernelBase = await this.repository.pando.contracts.kernel.new()
    const aclBase = await this.repository.pando.contracts.acl.new()
    const factory = await this.repository.pando.contracts.daoFactory.new(
      kernelBase.address,
      aclBase.address,
      '0x00'
    )
    // Deploy aragonOS-based DAO
    const receipt = await factory.newDAO(this.repository.config.author.account)
    const kernelAddress = receipt.logs.filter(l => l.event === 'DeployDAO')[0]
      .args.dao
    const kernel = await this.repository.pando.contracts.kernel.at(
      kernelAddress
    )
    const acl = await this.repository.pando.contracts.acl.at(await kernel.acl())
    // Grant current author APP_MANAGER_ROLE over the DAO
    const APP_MANAGER_ROLE = await kernel.APP_MANAGER_ROLE()
    const receipt2 = await acl.createPermission(
      this.repository.config.author.account,
      kernel.address,
      APP_MANAGER_ROLE,
      this.repository.config.author.account
    )
    // // Deploy tree app
    const tree = await this.repository.pando.contracts.tree.new()
    const receipt3 = await kernel.newAppInstance(
      Remote.TREE_BASE_APP_ID,
      tree.address
    )
    // // Create PUSH role
    const PUSH = await tree.PUSH()
    const receipt4 = await acl.createPermission(
      this.repository.config.author.account,
      tree.address,
      PUSH,
      this.repository.config.author.account
    )
    // // Save remote's address
    this.saveAddress(name, kernel.address)
    // // Create remote object
    const remote = new Remote(this.repository, kernel, acl, tree, name)
    // // Create remote master branch
    const master = await remote.branches.create('master')

    return remote

    // const { kernel, acl, tree } = await Remote.deploy(this.repository)
    // this.saveAddress(name, kernel.address)
    // const remote = new Remote(this.repository, kernel, acl, tree, name)
    // const master = await this.repository.branches.create('master', {
    //   remote: name
    // })
    // return remote
  }

  public async at(address: string): Promise<any> {
    const { kernel, acl, tree } = await Remote.at(this.repository, address)
    return { kernel, acl, tree }
  }

  public async load(name: string): Promise<Remote> {
    if (!this.exists(name)) {
      throw new Error("Remote '" + name + "' does not exist")
    }
    const address = this.loadAddress(name)
    const { kernel, acl, tree } = await this.at(address)
    const remote = new Remote(this.repository, kernel, acl, tree, name)

    return remote
  }

  public async add(name: string, address: string): Promise<Remote> {
    if (this.exists(name)) {
      throw new Error("Remote '" + name + "' already exists")
    }
    const { kernel, acl, tree } = await Remote.at(this.repository, address)
    this.saveAddress(name, kernel.address)

    return new Remote(this.repository, kernel, acl, tree, name)
  }

  public exists(name: string): boolean {
    return utils.fs.exists(npath.join(this.repository.paths.remotes, name))
  }

  public saveAddress(name: string, address: string): any {
    return utils.yaml.write(
      npath.join(this.repository.paths.remotes, name),
      address
    )
  }

  public loadAddress(name: string): any {
    return utils.yaml.read(npath.join(this.repository.paths.remotes, name))
  }
}
