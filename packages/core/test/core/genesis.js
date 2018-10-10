const Kernel          = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL             = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory      = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const PandoGenesis    = artifacts.require('PandoGenesis')


const { ADDR_NULL }    = require('../helpers/address')
const { HASH_NULL }    = require('../helpers/hash')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const blocknumber      = require('@aragon/test-helpers/blockNumber')(web3)

contract('PandoGenesis', accounts => {
    let factory, dao, genesis

    const root         = accounts[0]
    const origin       = accounts[1]
    const authorized   = accounts[2]
    const unauthorized = accounts[3]

    const iid_0             = { api: ADDR_NULL, hash: HASH_NULL }
    const individuation     = { origin: origin, tree: 'QwAwesomeIPFSHash', message: 'First individuation', metadata: '0x1987', parents: [iid_0] }

    const deploy = async () => {
        // DAO
        const receipt_1 = await factory.newDAO(root)
        const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        const acl       = await ACL.at(await dao.acl())
        await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
        // Genesis
        const receipt_2 = await dao.newAppInstance('0x0001', (await PandoGenesis.new()).address, { from: root })
        const genesis   = await PandoGenesis.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await acl.createPermission(authorized, genesis.address, await genesis.INDIVIDUATE_ROLE(), root, { from: root })
        await genesis.initialize({ from: root })

        return { dao, genesis }
    }

    before(async () => {
        const kernel_base = await Kernel.new(true) // petrify immediately
        const acl_base    = await ACL.new()
        const reg_factory = await RegistryFactory.new()
        factory           = await DAOFactory.new(kernel_base.address, acl_base.address, reg_factory.address)
    })

    beforeEach(async () => {
        ;({ dao, genesis } = await deploy())
    })

    context('#initialize', () => {
        it('should revert on reinitialization', async () => {
            return assertRevert(async () => {
                await genesis.initialize({ from: root })
            })
        })
    })

    context('#individuate', () => {
        context('sender has INDIVIDUATE_ROLE', () => {
            it('should map individuation', async () => {
                const receipt = await genesis.individuate(individuation, { from: authorized })
                const hash    = receipt.logs.filter(x => x.event == 'Individuate')[0].args.hash
                const mapped  = await genesis.getIndividuation(hash)

                assert.equal(mapped.origin, individuation.origin)
                assert.equal(mapped.blockstamp, await blocknumber())
                assert.equal(mapped.tree, individuation.tree)
                assert.equal(mapped.message, individuation.message)
                assert.equal(mapped.metadata, individuation.metadata)
                assert.equal(mapped.parents[0].api, iid_0.api)
                assert.equal(mapped.parents[0].hash, iid_0.hash)
            })

            it('should update head', async () => {
                const receipt = await genesis.individuate(individuation, { from: authorized })
                const hash    = receipt.logs.filter(x => x.event == 'Individuate')[0].args.hash
                const head    = await genesis.head()

                assert.equal(head, hash)
            })
        })

        context('sender does not have INDIVIDUATE_ROLE', () => {
            it('should revert', async () => {
                return assertRevert(async () => {
                    await genesis.individuate(individuation, { from: unauthorized })
                })
            })
        })
    })
})
