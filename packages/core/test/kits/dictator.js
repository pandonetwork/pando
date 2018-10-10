const Kernel          = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL             = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory      = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const MiniMeToken     = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')
const PandoGenesis    = artifacts.require('PandoGenesis')
const PandoLineage    = artifacts.require('PandoLineage')
const PandoAPI        = artifacts.require('PandoAPI')
const DictatorKit     = artifacts.require('DictatorKit')

const { ADDR_NULL }    = require('../helpers/address')
const { HASH_NULL }    = require('../helpers/hash')
const { RFI_STATE }    = require('../helpers/state')
const { RFL_STATE }    = require('../helpers/state')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')


contract('DictatorKit', accounts => {
    let factory, token, genesis, lineage, api, kit

    const root         = accounts[0]
    const origin       = accounts[1]
    const dependency   = accounts[2]
    const dictator     = accounts[3]
    const unauthorized = accounts[4]

    const iid_0         = { api: ADDR_NULL, hash: HASH_NULL }
    const individuation = { origin: origin, tree: 'QwAwesomeIPFSHash', message: 'First individuation', metadata: '0x1987', parents: [iid_0] }
    const lineage_0     = { destination: origin, minimum: 0, metadata: '0x1987' }
    const lineage_1     = { destination: dependency, minimum: 15, metadata: '0x1987' }

    const deploy = async () => {
        // MiniMeToken
        const token = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Lineage Token', 0, 'NLT', true)
        // DAO
        const receipt_1 = await factory.newDAO(root)
        const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        const acl       = await ACL.at(await dao.acl())
        await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
        // Genesis
        const receipt_2 = await dao.newAppInstance('0x0001', (await PandoGenesis.new()).address, { from: root })
        const genesis   = await PandoGenesis.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await genesis.initialize()
        // Lineage
        const receipt_3 = await dao.newAppInstance('0x0002', (await PandoLineage.new()).address, { from: root })
        const lineage   = await PandoLineage.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await token.changeController(lineage.address)
        await lineage.initialize(token.address)
        // API
        const receipt_4 = await dao.newAppInstance('0x0003', (await PandoAPI.new()).address, { from: root })
        const api       = await PandoAPI.at(receipt_4.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await acl.createPermission(api.address, genesis.address, await genesis.INDIVIDUATE_ROLE(), root, { from: root })
        await acl.createPermission(api.address, lineage.address, await lineage.MINT_ROLE(), root, { from: root })
        await acl.createPermission(api.address, lineage.address, await lineage.BURN_ROLE(), root, { from: root })
        await api.initialize(genesis.address, lineage.address, { from: root })
        // Kit
        const receipt_5 = await dao.newAppInstance('0x0004', (await DictatorKit.new()).address, { from: root })
        const kit       = await DictatorKit.at(receipt_5.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await acl.createPermission(dictator, kit.address, await kit.DICTATOR_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.CREATE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.MERGE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.REJECT_RFI_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.ACCEPT_RFL_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.REJECT_RFL_ROLE(), root, { from: root })

        await kit.initialize(api.address, { from: root })

        return { dao, token, genesis, lineage, api, kit }
    }

    before(async () => {
        const kernel_base = await Kernel.new(true) // petrify immediately
        const acl_base    = await ACL.new()
        const reg_factory = await RegistryFactory.new()

        factory           = await DAOFactory.new(kernel_base.address, acl_base.address, reg_factory.address)
    })

    beforeEach(async () => {
        ;({ token, genesis, lineage, api, kit } = await deploy())
    })

    context('#initialize', () => {
        it('should initialize DictatorKit', async () => {
            const api_address = await kit.api()

            assert.equal(api_address, api.address)
        })

        it('should revert on reinitialization', async () => {
            return assertRevert(async () => {
                await kit.initialize(api.address, { from: root })
            })
        })
    })

    context('Requests For Individuation | RFI', () => {
        context('#create', () => {
            it('should create RFI', async () => {
                const receipt = await kit.createRFI(individuation, [lineage_0], { from: root })
                const RFIid   = receipt.logs.filter(x => x.event == 'CreateRFI')[0].args.id.toNumber()

                assert.equal(RFIid, 1)
            })
        })

        context('#merge', () => {
            context('sender has DICTATOR_ROLE', () => {
                context('and RFI is pending', () => {
                    context('and all related RFLs are accepted', () => {
                        it('should merge RFI', async () => {
                            await kit.createRFI(individuation, [lineage_0], { from: dictator })
                            await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })
                            await kit.mergeRFI(1, { from: dictator })

                            const RFI = await api.getRFI(1)

                            assert.equal(RFI.state, RFI_STATE.MERGED)
                        })
                    })

                    context('but at least one of the related RFLs is not accepted yet', () => {
                        it('should revert', async () => {
                            const receipt = await kit.createRFI(individuation, [lineage_0], { from: dictator })

                            return assertRevert(async () => {
                                await kit.mergeRFI(1, { from: dictator })
                            })
                        })
                    })
                })

                context('but RFI is not pending anymore', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation, [lineage_0], { from: dictator })
                        await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })
                        await kit.mergeRFI(1, { from: dictator })

                        // RFI is already merged and thus not pending anymore
                        return assertRevert(async () => {
                            await kit.mergeRFI(1, { from: dictator })
                        })
                    })
                })
            })

            context('sender does not have DICTATOR_ROLE', () => {
                it('should revert', async () => {
                    await kit.createRFI(individuation, [lineage_0], { from: dictator })
                    await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })

                    return assertRevert(async () => {
                        await kit.mergeRFI(1, { from: unauthorized })
                    })
                })
            })
        })

        context('#reject', () => {
            context('sender has DICTATOR_ROLE', () => {
                context('and RFI is pending', () => {
                    it('should reject RFI', async () => {
                        await kit.createRFI(individuation, [lineage_0], { from: dictator })
                        await kit.rejectRFI(1, { from: dictator })

                        const RFI = await api.getRFI(1)

                        assert.equal(RFI.state, RFI_STATE.REJECTED)
                    })
                })

                context('but RFI is not pending anymore', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation, [lineage_0], { from: dictator })
                        await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })
                        await kit.mergeRFI(1, { from: dictator })

                        // RFI is already merged and thus not pending anymore
                        return assertRevert(async () => {
                            await kit.rejectRFI(1, { from: dictator })
                        })
                    })
                })
            })

            context('sender does not have DICTATOR_ROLE', () => {
                it('should revert', async () => {
                    await kit.createRFI(individuation, [lineage_0], { from: dictator })

                    return assertRevert(async () => {
                        await kit.rejectRFI(1, { from: unauthorized })
                    })
                })
            })
        })
    })

    context('Requests For Lineage | RFL', () => {
        context('#accept', () => {
            context('sender has DICTATOR_ROLE', () => {
                context('and RFL is pending', () => {
                    context('and value is superior or equal to minimum', () => {
                        it('should accept RFL', async () => {
                            await kit.createRFI(individuation, [lineage_0], { from: dictator })
                            await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })

                            const RFL = await api.getRFL(1)

                            assert.equal(RFL.state, RFL_STATE.ACCEPTED)
                        })

                        it("should update RFL's value", async () => {
                            await kit.createRFI(individuation, [lineage_0], { from: dictator })
                            await kit.acceptRFL(1, 15, { from: dictator })

                            const RFL = await api.getRFL(1)

                            assert.equal(RFL.value, 15)
                        })
                    })

                    context('but value is inferior to minimum', () => {
                        it('should revert', async () => {
                            await kit.createRFI(individuation, [lineage_1], { from: dictator })

                            return assertRevert(async () => {
                                await kit.acceptRFL(1, lineage_1.minimum - 1)
                            })
                        })
                    })
                })

                context('but RFL is not pending anymore', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation, [lineage_0], { from: dictator })
                        await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })

                        // RFL is already accepted and thus not pending anymore
                        return assertRevert(async () => {
                            await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })
                        })
                    })
                })
            })

            context('sender does not have DICTATOR_ROLE', () => {
                it('should revert', async () => {
                    await kit.createRFI(individuation, [lineage_0], { from: dictator })

                    return assertRevert(async () => {
                        await kit.acceptRFL(1, lineage_0.minimum, { from: unauthorized })
                    })
                })
            })
        })

        context('#reject', () => {
            context('sender has DICTATOR_ROLE', () => {
                context('and RFL is pending', () => {
                    it('should reject Request For Lineage', async () => {
                        await kit.createRFI(individuation, [lineage_0], { from: dictator })
                        await kit.rejectRFL(1,{ from: dictator })

                        const RFL = await api.getRFL(1)

                        assert.equal(RFL.state, RFL_STATE.REJECTED)
                    })
                })

                context('but RFL is not pending anymore', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation, [lineage_0], { from: dictator })
                        await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })

                        // RFL is already accepted and thus not pending anymore
                        return assertRevert(async () => {
                            await kit.rejectRFL(1, { from: dictator })
                        })
                    })
                })
            })

            context('sender does not have DICTATOR_ROLE', () => {
                it('should revert', async () => {
                    await kit.createRFI(individuation, [lineage_0], { from: dictator })

                    return assertRevert(async () => {
                        await kit.rejectRFL(1, { from: unauthorized })
                    })
                })
            })
        })
    })
})
