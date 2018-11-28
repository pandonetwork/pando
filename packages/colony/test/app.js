const Kernel          = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL             = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory      = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
// const MiniMeToken     = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')
const Colony          = artifacts.require('Colony')
// const PandoLineage    = artifacts.require('PandoLineage')
// const PandoAPI        = artifacts.require('PandoAPI')

const { ADDR_NULL }    = require('./helpers/address')
const { HASH_NULL }    = require('./helpers/hash')
const { RFI_STATE }    = require('./helpers/state')
const { RFL_STATE }    = require('./helpers/state')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const blocknumber      = require('@aragon/test-helpers/blockNumber')(web3)


contract('PandoAPI', accounts => {
    let factory, dao, colony

    const root         = accounts[0]
    const origin       = accounts[1]
    const dependency   = accounts[2]
    const authorized   = accounts[3]
    const unauthorized = accounts[4]

    const iid_0         = { api: ADDR_NULL, hash: HASH_NULL }
    const individuation = { origin: origin, tree: 'QwAwesomeIPFSHash', message: 'First individuation', metadata: '0x1987', parents: [iid_0] }
    const lineage_0     = { destination: origin, minimum: 0, metadata: '0x1987' }
    const lineage_1     = { destination: dependency, minimum: 15, metadata: '0x1987' }

    const deploy = async () => {
        // MiniMeToken
        // const token = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Lineage Token', 0, 'NLT', true)
        // DAO
        const receipt_1 = await factory.newDAO(root)
        const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        const acl       = await ACL.at(await dao.acl())
        await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })

        // Genesis
        let params = web3.eth.abi.encodeParameter('address', '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1')


        const receipt_2 = await dao.methods['newAppInstance(bytes32,address)']('0x0002', (await Colony.new()).address)
        const colony   = await Colony.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await colony.initialize('0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1')


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
        return { dao, colony }
    }

    before(async () => {
        const kernel_base = await Kernel.new(true) // petrify immediately
        const acl_base    = await ACL.new()
        const reg_factory = await RegistryFactory.new()
        factory           = await DAOFactory.new(kernel_base.address, acl_base.address, reg_factory.address)
    })

    beforeEach(async () => {
        ;({ dao, colony } = await deploy())
    })

    context('#initialize', () => {
      it('should initialize PandoAPI', async () => {
        let ens = await colony.ens()
        let resolver = await colony.resolver()
        let appId= await colony.organismAppId()
        let base = await colony.organismBase()

        console.log(ens)
        console.log(resolver)
        console.log(appId)
        console.log(base)
      })
    })
})
