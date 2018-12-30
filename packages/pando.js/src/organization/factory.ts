import APM          from '@aragon/apm'
import Web3         from 'web3'
import Pando        from '..'
import Organization from '.'


export default class OrganizationFactory {
    public pando: Pando

    constructor(pando: Pando) {
        this.pando = pando
    }

    public async deploy(): Promise<any> {
      const apm     = APM(new Web3(this.pando.options.ethereum.provider), { ensRegistryAddress: this.pando.options.apm.ens, ipfs: 'http://locahost:5001' })
      const factory = await this.pando.contracts.OrganizationFactory.at(await apm.getLatestVersionContract('organization-factory.aragonpm.eth'))
      const receipt = await factory.newInstance()

      const kernel = await this.pando.contracts.Kernel.at(this._getDAOAddressFromReceipt(receipt))
      const acl    = await this.pando.contracts.ACL.at(await kernel.acl())


      const organization = new Organization(this.pando, kernel, acl)

      await organization.initialize()

      return organization


        // const kernel_base = await Kernel.new(true) // petrify immediately
        // const acl_base    = await ACL.new()
        // const reg_factory = await RegistryFactory.new()
        //
        // const dao = await KernelProxy.new(kernel_base.address)
        //
        //
        // dao = Kernel(new KernelProxy(baseKernel));
        //
        // if (address(regFactory) == address(0)) {
        //     dao.initialize(baseACL, _root);
        // } else {
        //     dao.initialize(baseACL, this);
        //
        //     ACL acl = ACL(dao.acl());
        //     bytes32 permRole = acl.CREATE_PERMISSIONS_ROLE();
        //     bytes32 appManagerRole = dao.APP_MANAGER_ROLE();
        //
        //     acl.grantPermission(regFactory, acl, permRole);
        //
        //     acl.createPermission(regFactory, dao, appManagerRole, this);
        //
        //     EVMScriptRegistry reg = regFactory.newEVMScriptRegistry(dao, _root);
        //     DeployEVMScriptRegistry(address(reg));
        //
        //     acl.revokePermission(regFactory, dao, appManagerRole);
        //     acl.revokePermission(regFactory, acl, permRole);
        //     acl.revokePermission(this, acl, permRole);
        //     acl.grantPermission(_root, acl, permRole);
        //
        //     acl.removePermissionManager(dao, appManagerRole);
        //     acl.setPermissionManager(_root, acl, permRole);
        // }
        //
        // DeployDAO(address(dao));
    }

    private _getDAOAddressFromReceipt(receipt: any): string {
      return receipt.logs.filter(l => l.event == 'DeployInstance')[0].args.dao
    }

        // const token = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Lineage Token', 0, 'NLT', true)
        // // DAO
        // const receipt_1 = await factory.newDAO(root)
        // const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        // const acl       = await ACL.at(await dao.acl())
        // await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
        // // Genesis
        // const receipt_2 = await dao.newAppInstance('0x0001', (await PandoGenesis.new()).address, { from: root })
        // const genesis   = await PandoGenesis.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // await genesis.initialize()
        // // Lineage
        // const receipt_3 = await dao.newAppInstance('0x0002', (await PandoLineage.new()).address, { from: root })
        // const lineage   = await PandoLineage.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // await token.changeController(lineage.address)
        // await lineage.initialize(token.address)
        // // API
        // const receipt_4 = await dao.newAppInstance('0x0003', (await PandoAPI.new()).address, { from: root })
        // const api       = await PandoAPI.at(receipt_4.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // await acl.createPermission(api.address, genesis.address, await genesis.INDIVIDUATE_ROLE(), root, { from: root })
        // await acl.createPermission(api.address, lineage.address, await lineage.MINT_ROLE(), root, { from: root })
        // await acl.createPermission(api.address, lineage.address, await lineage.BURN_ROLE(), root, { from: root })
        // await acl.createPermission(authorized, api.address, await api.CREATE_RFI_ROLE(), root, { from: root })
        // await acl.createPermission(authorized, api.address, await api.MERGE_RFI_ROLE(), root, { from: root })
        // await acl.createPermission(authorized, api.address, await api.REJECT_RFI_ROLE(), root, { from: root })
        // await acl.createPermission(authorized, api.address, await api.ACCEPT_RFL_ROLE(), root, { from: root })
        // await acl.createPermission(authorized, api.address, await api.REJECT_RFL_ROLE(), root, { from: root })
        // await api.initialize(genesis.address, lineage.address, { from: root })
        //
        // return { dao, token, genesis, lineage, api }
    // }
}
