import Loom          from '@components/loom'
import { keccak256 } from 'js-sha3'
import { hash }      from 'eth-ens-namehash'

export default class Remote {
  public static TREE_APP_ID = hash('tree.pando.aragonpm.test')

  public loom:   Loom
  public name:   string
  public hash:   string
  public kernel: any
  public acl?:   any
  public tree?:  any
  
  public constructor (_loom: Loom, _kernel: any, _acl: any, _tree: any, _name: string) {
    this.loom   = _loom
    this.name   = _name
    this.hash   = '0x' + keccak256(_name)
    this.kernel = _kernel
    this.acl    = _acl
    this.tree   = _tree
  }
  
  public static async deploy (_loom: Loom, _name: string): Promise < Remote > {
    // Deploy base contracts
    let kernelBase = await _loom.pando.contracts.kernel.new()
    let aclBase    = await _loom.pando.contracts.acl.new()
    let factory    = await _loom.pando.contracts.daoFactory.new(kernelBase.address, aclBase.address, '0x00')
    // Deploy aragonOS-based DAO
    let receipt       = await factory.newDAO(_loom.config.author.account) 
    let kernelAddress = receipt.logs.filter(l => l.event === 'DeployDAO')[0].args.dao
    let kernel        = await _loom.pando.contracts.kernel.at(kernelAddress)
    let acl           = await _loom.pando.contracts.acl.at(await kernel.acl())
    // Grant current author APP_MANAGER_ROLE over the DAO    
    let APP_MANAGER_ROLE = await kernel.APP_MANAGER_ROLE()
    let receipt2         = await acl.createPermission(_loom.config.author.account, kernel.address, APP_MANAGER_ROLE, _loom.config.author.account)
    // Deploy tree app
    let base     = await _loom.pando.contracts.tree.new()
    let receipt3 = await kernel.newAppInstance(Remote.TREE_APP_ID, base.address)
    let treeAddress  = receipt3.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy
    let tree = await _loom.pando.contracts.tree.at(treeAddress)    
  // Create PUSH role
    const PUSH   = await tree.PUSH()
    let receipt4 = await acl.createPermission(_loom.config.author.account, tree.address, PUSH, _loom.config.author.account)
    
    return new Remote(_loom, kernel, acl, tree, _name)
  }
  
  public static async at (_loom: Loom, _kernelAddress: string, _aclAddress: string, _treeAddress: string, _name: string): Promise < Remote > {
    let kernel = await _loom.pando.contracts.kernel.at(_kernelAddress)
    let acl    = await _loom.pando.contracts.kernel.at(_aclAddress)
    let tree   = await _loom.pando.contracts.kernel.at(_treeAddress)
    
    return new Remote(_loom, kernel, acl, tree, _name)
  }
  // public async push (cid: string): Promise < any > {
  //   let tx = await this.tree.setRepository(cid)
  //   return tx
  // }
  // 
  // public async head (): Promise < string > {
  //   let cid = await this.tree.getRepository()
  //   return cid
  // }
  // 
  // public grantPushRole (): Promise < any > {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       let PUSH = await this.tree.PUSH()
  //       let receipt = await this.acl.grantPermission(this.pando.configuration.author.account, this.tree.address, PUSH)
  //       resolve(receipt)
  //     } catch (err) {
  //       reject(err)
  //     }
  //   })
  // }

}