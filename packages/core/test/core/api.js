const Kernel          = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL             = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory      = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const MiniMeToken     = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')
const PandoGenesis    = artifacts.require('PandoGenesis')
const PandoLineage    = artifacts.require('PandoLineage')
const PandoAPI        = artifacts.require('PandoAPI')

const { ADDR_NULL }    = require('../helpers/address')
const { HASH_NULL }    = require('../helpers/hash')
const { RFI_STATE }    = require('../helpers/state')
const { RFL_STATE }    = require('../helpers/state')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const blocknumber      = require('@aragon/test-helpers/blockNumber')(web3)


contract('PandoAPI', accounts => {
    let factory, token, genesis, lineage, api

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
        await acl.createPermission(authorized, api.address, await api.CREATE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(authorized, api.address, await api.MERGE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(authorized, api.address, await api.REJECT_RFI_ROLE(), root, { from: root })
        await acl.createPermission(authorized, api.address, await api.ACCEPT_RFL_ROLE(), root, { from: root })
        await acl.createPermission(authorized, api.address, await api.REJECT_RFL_ROLE(), root, { from: root })
        await api.initialize(genesis.address, lineage.address, { from: root })

        return { dao, token, genesis, lineage, api }
    }

    before(async () => {
        const kernel_base = await Kernel.new(true) // petrify immediately
        const acl_base    = await ACL.new()
        const reg_factory = await RegistryFactory.new()
        factory           = await DAOFactory.new(kernel_base.address, acl_base.address, reg_factory.address)
    })

    beforeEach(async () => {
        ;({ token, genesis, lineage, api } = await deploy())
    })

    context('#initialize', () => {
        it('should initialize PandoAPI', async () => {
            const genesis_address = await api.genesis()
            const lineage_address = await api.lineage()

            assert.equal(genesis_address, genesis.address)
            assert.equal(lineage_address, lineage.address)
        })

        it('should revert on reinitialization', async () => {
            return assertRevert(async () => {
                await api.initialize(genesis.address, lineage.address, { from: root })
            })
        })
    })

    context('Requests For Individuation | RFI', () => {
        context('#create', () => {
            context('sender has CREATE_RFI_ROLE', () => {
                it('should create RFI', async () => {
                    const receipt = await api.createRFI(individuation, [lineage_0], { from: authorized })
                    const RFIid   = receipt.logs.filter(x => x.event == 'CreateRFI')[0].args.id.toNumber()

                    assert.equal(RFIid, 1)
                })

                it('should initialize RFI', async () => {
                    await api.createRFI(individuation, [lineage_0, lineage_1], { from: authorized })

                    const RFI = await api.getRFI(1)

                    assert.equal(RFI.individuation.origin, individuation.origin)
                    assert.equal(RFI.individuation.tree, individuation.tree)
                    assert.equal(RFI.individuation.message, individuation.message)
                    assert.equal(RFI.individuation.metadata, individuation.metadata)
                    assert.equal(RFI.individuation.parents[0].api,  individuation.parents[0].api)
                    assert.equal(RFI.individuation.parents[0].hash, individuation.parents[0].hash)
                    assert.equal(RFI.blockstamp, await blocknumber())
                    assert.equal(RFI.state, RFI_STATE.PENDING)
                    assert.equal(RFI.RFLids[0], 1)
                    assert.equal(RFI.RFLids[1], 2)
                })

                it('should initialize related RFLs', async () => {
                    await api.createRFI(individuation, [lineage_0], { from: authorized })
                    await api.createRFI(individuation, [lineage_1], { from: authorized })

                    const RFL_1 = await api.getRFL(1)
                    const RFL_2 = await api.getRFL(2)

                    assert.equal(RFL_1.lineage.destination, lineage_0.destination)
                    assert.equal(RFL_1.lineage.minimum, lineage_0.minimum)
                    assert.equal(RFL_1.lineage.metadata, lineage_0.metadata)
                    assert.equal(RFL_1.blockstamp, await blocknumber() - 1)
                    assert.equal(RFL_1.state, RFL_STATE.PENDING)
                    assert.equal(RFL_1.RFIid, 1)

                    assert.equal(RFL_2.lineage.destination, lineage_1.destination)
                    assert.equal(RFL_2.lineage.minimum, lineage_1.minimum)
                    assert.equal(RFL_2.lineage.metadata, lineage_1.metadata)
                    assert.equal(RFL_2.blockstamp, await blocknumber())
                    assert.equal(RFL_2.state, RFL_STATE.PENDING)
                    assert.equal(RFL_2.RFIid, 2)
                })
            })

            context('sender does not have CREATE_RFI_ROLE', () => {
                it('should revert', async () => {
                    return assertRevert(async () => {
                        await api.createRFI(individuation, [lineage_0], { from: unauthorized })
                    })
                })
            })
        })

        context('#merge', () => {
            context('RFI exists', () => {
                context('and sender has MERGE_RFI_ROLE', () => {
                    context('and RFI is pending', () => {
                        context('and all related RFLs are accepted', () => {
                            it('should merge RFI', async () => {
                                await api.createRFI(individuation, [lineage_0], { from: authorized })
                                await api.acceptRFL(1, lineage_0.minimum, { from: authorized })
                                await api.mergeRFI(1, { from: authorized })

                                const RFI = await api.getRFI(1)

                                assert.equal(RFI.state, RFI_STATE.MERGED)
                            })

                            it('should update genesis head', async () => {
                                await api.createRFI(individuation, [lineage_0], { from: authorized })
                                await api.acceptRFL(1, lineage_0.minimum, { from: authorized })
                                await api.mergeRFI(1, { from: authorized })

                                const head = await api.head()
                                const hash = await api.getIndividuationHash([origin, await blocknumber(), 'QwAwesomeIPFSHash', 'First individuation', '0x1987', [iid_0]])

                                assert.equal(head, hash)
                            })

                            it('should issue related RFLs', async () => {
                                await api.createRFI(individuation, [lineage_0, lineage_1], { from: authorized })
                                await api.acceptRFL(1, 25, { from: authorized })
                                await api.acceptRFL(2, 45, { from: authorized })
                                await api.mergeRFI(1, { from: authorized })

                                const RFL_1 = await api.getRFL(1)
                                const RFL_2 = await api.getRFL(2)

                                const balance_origin     = await token.balanceOf(origin)
                                const balance_dependency = await token.balanceOf(dependency)

                                assert.equal(RFL_1.state, RFL_STATE.ISSUED)
                                assert.equal(RFL_2.state, RFL_STATE.ISSUED)
                                assert.equal(balance_origin, 25)
                                assert.equal(balance_dependency, 45)
                            })
                        })

                        context('but at least one of the related RFLs is not accepted', () => {
                            it('should revert', async () => {
                                const receipt = await api.createRFI(individuation, [lineage_0], { from: authorized })

                                return assertRevert(async () => {
                                    await api.mergeRFI(1, { from: authorized })
                                })
                            })
                        })
                    })

                    context('but RFI is not pending anymore', () => {
                        it('should revert', async () => {
                            await api.createRFI(individuation, [lineage_0], { from: authorized })
                            await api.acceptRFL(1, lineage_0.minimum, { from: authorized })
                            await api.mergeRFI(1, { from: authorized })

                            // RFI is already merged and thus not pending anymore
                            return assertRevert(async () => {
                                await api.mergeRFI(1, { from: authorized })
                            })
                        })
                    })
                })

                context('but sender does not have SORT_RFI_ROLE', () => {
                    it('should revert', async () => {
                        await api.createRFI(individuation, [lineage_0], { from: authorized })
                        await api.acceptRFL(1, lineage_0.minimum, { from: authorized })

                        return assertRevert(async () => {
                            await api.mergeRFI(1, { from: unauthorized })
                        })
                    })
                })
            })

            context('RFI does not exist', () => {
                it('should revert', async () => {
                    return assertRevert(async () => {
                        await api.mergeRFI(1, { from: authorized })
                    })
                })
            })
        })

        context('#reject', () => {
            context('RFI exists', () => {
                context('and sender has REJECT_RFI_ROLE', () => {
                    context('and RFI is pending', () => {
                        it('should reject RFI', async () => {
                            await api.createRFI(individuation, [lineage_0], { from: authorized })
                            await api.rejectRFI(1, { from: authorized })

                            const RFI = await api.getRFI(1)

                            assert.equal(RFI.state, RFI_STATE.REJECTED)
                        })

                        it('should cancel all related RFLs', async () => {
                            await api.createRFI(individuation, [lineage_0, lineage_1], { from: authorized })
                            await api.rejectRFI(1, { from: authorized })

                            const RFL_1 = await api.getRFL(1)
                            const RFL_2 = await api.getRFL(2)

                            assert.equal(RFL_1.state, RFL_STATE.CANCELLED)
                            assert.equal(RFL_2.state, RFL_STATE.CANCELLED)
                        })
                    })

                    context('but RFI is not pending anymore', () => {
                        it('should revert', async () => {
                            await api.createRFI(individuation, [lineage_0], { from: authorized })
                            await api.acceptRFL(1, lineage_0.minimum, { from: authorized })
                            await api.mergeRFI(1, { from: authorized })

                            // RFI is already merged and thus not pending anymore
                            return assertRevert(async () => {
                                await api.rejectRFI(1, { from: authorized })
                            })
                        })
                    })
                })

                context('but sender does not have REJECT_RFI_ROLE', () => {
                    it('should revert', async () => {
                        await api.createRFI(individuation, [lineage_0], { from: authorized })

                        return assertRevert(async () => {
                            await api.rejectRFI(1, { from: unauthorized })
                        })
                    })
                })
            })

            context('RFI does not exist', () => {
                it('should revert', async () => {
                    return assertRevert(async () => {
                        await api.rejectRFI(1, { from: authorized })
                    })
                })
            })
        })
    })

    context('Requests For Lineage | RFL', () => {
        context('#accept', () => {
            context('RFL exists', () => {
                context('and sender has ACCEPT_RFL_ROLE', () => {
                    context('and RFL is pending', () => {
                        context('and value is superior or equal to minimum', () => {
                            it('should accept RFL', async () => {
                                await api.createRFI(individuation, [lineage_0], { from: authorized })
                                await api.acceptRFL(1, lineage_0.minimum, { from: authorized })

                                const RFL = await api.getRFL(1)

                                assert.equal(RFL.state, RFL_STATE.ACCEPTED)
                            })

                            it('should update RFL value', async () => {
                                await api.createRFI(individuation, [lineage_0], { from: authorized })
                                await api.acceptRFL(1, 15, { from: authorized })

                                const RFL = await api.getRFL(1)

                                assert.equal(RFL.value, 15)
                            })
                        })

                        context('but value is inferior to minimum', () => {
                            it('should revert', async () => {
                                await api.createRFI(individuation, [lineage_1], { from: authorized })

                                return assertRevert(async () => {
                                    await api.acceptRFL(1, lineage_1.minimum - 1)
                                })
                            })
                        })
                    })

                    context('but RFL is not pending anymore', () => {
                        it('should revert', async () => {
                            await api.createRFI(individuation, [lineage_0], { from: authorized })
                            await api.acceptRFL(1, lineage_0.minimum, { from: authorized })

                            // RFL is already accepted and thus not pending anymore
                            return assertRevert(async () => {
                                await api.acceptRFL(1, lineage_0.minimum, { from: authorized })
                            })
                        })
                    })
                })

                context('but sender does not have ACCEPT_RFL_ROLE', () => {
                    it('should revert', async () => {
                        await api.createRFI(individuation, [lineage_0], { from: authorized })

                        return assertRevert(async () => {
                            await api.acceptRFL(1, lineage_0.minimum, { from: unauthorized })
                        })
                    })
                })
            })

            context('RFL does not exist', () => {
                it('should revert', async () => {
                    return assertRevert(async () => {
                        await api.acceptRFL(1, lineage_0.minimum, { from: authorized })
                    })
                })
            })
        })

        context('#reject', () => {
            context('RFL exists', () => {
                context('and sender has REJECT_RFL_ROLE', () => {
                    context('and RFL is pending', () => {
                        it('should reject RFL', async () => {
                            await api.createRFI(individuation, [lineage_0], { from: authorized })
                            await api.rejectRFL(1,{ from: authorized })

                            const RFL = await api.getRFL(1)

                            assert.equal(RFL.state, RFL_STATE.REJECTED)
                        })

                        it('should cancel related RFI', async () => {
                            await api.createRFI(individuation, [lineage_0, lineage_1], { from: authorized })
                            await api.rejectRFL(1,{ from: authorized })

                            const RFI = await api.getRFI(1)

                            assert.equal(RFI.state, RFI_STATE.CANCELLED)
                        })

                        it('should cancel related RFLs', async () => {
                            await api.createRFI(individuation, [lineage_0, lineage_1], { from: authorized })
                            await api.rejectRFL(1, { from: authorized })

                            const RFL = await api.getRFL(2)

                            assert.equal(RFL.state, RFL_STATE.CANCELLED)
                        })
                    })

                    context('but RFL is not pending anymore', () => {
                        it('should revert', async () => {
                            await api.createRFI(individuation, [lineage_0], { from: authorized })
                            await api.acceptRFL(1, lineage_0.minimum, { from: authorized })

                            // RFL is already accepted and thus not pending anymore
                            return assertRevert(async () => {
                                await api.rejectRFL(1, { from: authorized })
                            })
                        })
                    })
                })

                context('but sender does not have REJECT_RFL_ROLE', () => {
                    it('should revert', async () => {
                        await api.createRFI(individuation, [lineage_0], { from: authorized })

                        return assertRevert(async () => {
                            await api.rejectRFL(1, { from: unauthorized })
                        })
                    })
                })
            })

            context('RFL does not exist', () => {
                it('should revert', async () => {
                    return assertRevert(async () => {
                        await api.rejectRFL(1, { from: authorized })
                    })
                })
            })
        })
    })
})
