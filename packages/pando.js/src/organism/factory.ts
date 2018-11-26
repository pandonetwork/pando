import Pando from '..'
import Organism from '.'


export default class OrganismFactory {

    public pando: Pando

    constructor(pando: Pando) {
        this.pando = pando
    }

    public async deploy(): Promise<Organism> {
        return new Organism('0x00')

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
    }
}
