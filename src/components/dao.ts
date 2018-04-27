import Pando0x from '@pando0x'

export default class DAO {
    
  public pando0x: Pando0x
  public kernel: any
  public acl?: any
  public tree?: any
  
  public constructor (_pando0x: Pando0x, _kernel: any, _acl: any, opts?: any) {
    this.pando0x = _pando0x
    this.kernel = _kernel
    this.acl = _acl
  }
  
  public static deploy (_pando0x: Pando0x, opts?: any): Promise < DAO > {
    return new Promise < DAO > (async (resolve, reject) => {
      try {
        let kernelBase = await _pando0x.contracts.kernel.new()
        let aclBase = await _pando0x.contracts.acl.new()
        let factory = await _pando0x.contracts.daoFactory.new(kernelBase.address, aclBase.address, '0x00')
        let receipt = await factory.newDAO(_pando0x.configuration.user.account)
        
        let address = receipt.logs.filter(l => l.event === 'DeployDAO')[0].args.dao
        let kernel = await _pando0x.contracts.kernel.at(address)
        let acl = await _pando0x.contracts.acl.at(await kernel.acl())
        
        console.log('Kernel deployed at: ' + kernel.address)
        
        let dao = new DAO(_pando0x, kernel, acl)
        resolve(dao)
      } catch (err) {
        reject(err)
      }
    })
  }
  
  public grantAppManagerRole (opts?: any): Promise < any > {
    return new Promise < any > (async (resolve, reject) => {
      try {
        let APP_MANAGER_ROLE = await this.kernel.APP_MANAGER_ROLE()
        let receipt = await this.acl.createPermission(
          this.pando0x.configuration.user.account,
          this.kernel.address,
          APP_MANAGER_ROLE,
          this.pando0x.configuration.user.account
        )
        resolve(receipt)
      } catch (err) {
        reject(err)
      }
    })
  }
  
  public deployTree (opts?: any): Promise < any > {
    return new Promise < any > (async (resolve, reject) => {
      try {
        const APP_BASE_NAMESPACE = Pando0x.utils.aragon.APP_BASE_NAMESPACE
        const appId = Pando0x.utils.aragon.namehash('pando.aragonpm.test')
        
        let pando = await this.pando0x.contracts.pando.new()
        let receipt = await this.kernel.setApp(APP_BASE_NAMESPACE, appId, pando.address)
        let initializationPayload = pando.contract.initialize.getData()
        let proxy = await this.pando0x.contracts.appProxyUpgradeable.new(this.kernel.address, appId, initializationPayload, { gas: 5e6 })
        
        this.tree = await this.pando0x.contracts.pando.at(pando.address)
        
        console.log('Tree app deployed at: ' + this.tree.address)
        
        resolve(receipt)
      } catch (err) {
        reject(err)
      }
    })
  }

  public grantPushRole (): Promise < any > {
    return new Promise(async (resolve, reject) => {
      try {
        let PUSH = await this.tree.PUSH()
        let receipt = await this.acl.grantPermission(this.pando0x.configuration.user.account, this.tree.address, PUSH)
        resolve(receipt)
      } catch (err) {
        reject(err)
      }
    })
  }

}