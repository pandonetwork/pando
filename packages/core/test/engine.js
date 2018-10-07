const Kernel          = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL             = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory      = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const MiniMeToken     = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')
const PandoHistory    = artifacts.require('PandoHistory')
const PandoAPI        = artifacts.require('PandoAPI')
const PandoLineage    = artifacts.require('PandoLineage')

const { ADDR_NULL }    = require('./helpers/address')
const { HASH_NULL }    = require('./helpers/hash')
const { RFI_STATE }    = require('./helpers/state')
const { RFL_STATE }    = require('./helpers/state')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const blocknumber      = require('@aragon/test-helpers/blockNumber')(web3)

const createdVoteId = receipt => receipt.logs.filter(x => x.event == 'StartVote')[0].args.voteId


const RFI_SORTING = ['MERGE', 'REJECT', 'CANCEL'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})


const createdRFIid = receipt => receipt.logs.filter(x => x.event == 'CreateRFI')[0].args.id.toNumber()

contract('PandoAPI', accounts => {
    let factory, token, history, lineage, api

    const root         = accounts[0]
    const origin       = accounts[1]
    const dependency   = accounts[2]
    const authorized   = accounts[3]
    const unauthorized = accounts[4]

    const iid_0             = { api: ADDR_NULL, hash: HASH_NULL }
    const iid_0_abi         = [ADDR_NULL, HASH_NULL]
    const individuation     = { origin: origin, tree: 'QwAwesomeIPFSHash', message: 'First individuation', metadata: '0x1987', parents: [iid_0] }
    const individuation_abi = [origin, 'QwAwesomeIPFSHash', 'First individuation', '0x1987', [iid_0_abi]]
    const lineage_0         = { destination: origin, minimum: 0, metadata: '0x1987' }
    const lineage_0_abi     = [origin, 0, '0x1987']
    const lineage_1         = { destination: dependency, minimum: 15, metadata: '0x1987' }
    const lineage_1_abi     = [dependency, 15, '0x1987']

    const deploy = async () => {
        // MiniMeToken
        const token = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Lineage Token', 0, 'NLT', true)
        // DAO
        const receipt_1 = await factory.newDAO(root)
        const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        const acl       = await ACL.at(await dao.acl())
        await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
        // Genesis
        const receipt_4 = await dao.newAppInstance('0x0002', (await PandoHistory.new()).address, { from: root })
        const history   = await PandoHistory.at(receipt_4.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await history.initialize()
        // Lineage
        const receipt_2    = await dao.newAppInstance('0x0001', (await PandoLineage.new()).address, { from: root })
        const lineage      = await PandoLineage.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await token.changeController(lineage.address)
        await lineage.initialize(token.address)
        // API
        const receipt_5 = await dao.newAppInstance('0x4321', (await PandoAPI.new()).address, { from: root })
        const api       = await PandoAPI.at(receipt_5.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await api.initialize(history.address, lineage.address, { from: root })

        await acl.createPermission(authorized, api.address, await api.CREATE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(authorized, api.address, await api.SORT_RFI_ROLE(), root, { from: root })
        await acl.createPermission(authorized, api.address, await api.CREATE_RFL_ROLE(), root, { from: root })
        await acl.createPermission(authorized, api.address, await api.VALUATE_RFL_ROLE(), root, { from: root })
        await acl.createPermission(authorized, api.address, await api.REJECT_RFL_ROLE(), root, { from: root })

        await acl.createPermission(api.address, lineage.address, await lineage.MINT_ROLE(), root, { from: root })
        await acl.createPermission(api.address, lineage.address, await lineage.BURN_ROLE(), root, { from: root })

        return { token, history, lineage, api }
    }

    before(async () => {
        const kernel_base = await Kernel.new(true) // petrify immediately
        const acl_base    = await ACL.new()
        const reg_factory = await RegistryFactory.new()

        factory           = await DAOFactory.new(kernel_base.address, acl_base.address, reg_factory.address)
    })

    beforeEach(async () => {
        ;({ token, history, lineage, api } = await deploy())
    })

    context('#initialize', () => {
        it('should initialize genesis and lineage addresses correctly', async () => {
            const genesis_address = await api.history()
            const lineage_address = await api.lineage()

            assert.equal(genesis_address, history.address)
            assert.equal(lineage_address, lineage.address)
        })

        it('should fail on reinitialization', async () => {
            return assertRevert(async () => {
                await api.initialize(history.address, lineage.address, { from: root })
            })
        })
    })

    context('Requests For Commit | RFC', () => {
        context('#create', () => {
            context('sender has CREATE_RFI_ROLE', () => {
                it('should succeed to create Request For Individuation', async () => {
                    const receipt = await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                    const RFIid   = createdRFIid(receipt)

                    assert.equal(RFIid, 1)
                })

                it('should initialize Request For Individuation correctly', async () => {
                    await api.createRFI(individuation_abi, [lineage_0_abi, lineage_1_abi], { from: authorized })

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

                it('should initialize related Requests For Lineage correctly', async () => {
                    await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                    await api.createRFI(individuation_abi, [lineage_1_abi], { from: authorized })

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
                        await api.createRFI(individuation_abi, [lineage_0_abi], { from: unauthorized })
                    })
                })
            })
        })

        context('#sort', () => {
            context('sender has SORT_RFI_ROLE', () => {
                context('and Request For Individuation is pending', () => {
                    context('and sorting instruction is to merge', () => {
                        context('and all related Requests For Lineage are valuated', () => {
                            it('should succeed to merge Request For Individuation', async () => {
                                await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                                await api.valuateRFL(1, lineage_0.minimum, { from: authorized })
                                await api.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })

                                const RFI = await api.getRFI(1)

                                assert.equal(RFI.state, RFI_STATE.MERGED)
                            })

                            it('should update genesis head', async () => {
                                await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                                await api.valuateRFL(1, lineage_0.minimum, { from: authorized })
                                await api.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })

                                const head = await api.head()
                                const hash = await api.getIndividuationHash([origin, await blocknumber(), 'QwAwesomeIPFSHash', 'First individuation', '0x1987', [iid_0_abi]])

                                assert.equal(head, hash)
                            })

                            it('should mint and assign related lineage', async () => {
                                await api.createRFI(individuation_abi, [lineage_0_abi, lineage_1_abi], { from: authorized })
                                await api.valuateRFL(1, 25, { from: authorized })
                                await api.valuateRFL(2, 45, { from: authorized })
                                await api.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })
                                await api.sortRFI(2, RFI_SORTING.MERGE, { from: authorized })

                                const balance_origin     = await token.balanceOf(origin)
                                const balance_dependency = await token.balanceOf(dependency)

                                assert.equal(balance_origin, 25)
                                assert.equal(balance_dependency, 45)
                            })
                        })

                        context('but at least one of the related Requests For Lineage is not valuated', () => {
                            it('should revert', async () => {
                                const receipt = await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })

                                return assertRevert(async () => {
                                    await api.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })
                                })
                            })
                        })
                    })

                    context('and sorting instruction is to reject', () => {
                        it('should succeed to reject Request For Individuation', async () => {
                            await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                            await api.sortRFI(1, RFI_SORTING.REJECT, { from: authorized })

                            const RFI = await api.getRFI(1)

                            assert.equal(RFI.state, RFI_STATE.REJECTED)
                        })

                        it('should cancel related Requests For Lineage', async () => {
                            await api.createRFI(individuation_abi, [lineage_0_abi, lineage_1_abi], { from: authorized })
                            await api.sortRFI(1, RFI_SORTING.REJECT, { from: authorized })

                            const RFL_1 = await api.getRFL(1)
                            const RFL_2 = await api.getRFL(2)

                            assert.equal(RFL_1.state, RFL_STATE.CANCELLED)
                            assert.equal(RFL_2.state, RFL_STATE.CANCELLED)
                        })
                    })
                })

                context('but Request For Individuation is not pending anymore', () => {
                    it('should revert', async () => {
                        await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                        await api.valuateRFL(1, lineage_0.minimum, { from: authorized })
                        await api.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })

                        // RFI is already merged and thus not pending anymore
                        return assertRevert(async () => {
                            await api.sortRFI(1, RFI_SORTING.REJECT, { from: authorized })
                        })
                    })
                })
            })

            context('sender does not have SORT_RFI_ROLE', () => {
                it('should revert', async () => {
                    await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                    await api.valuateRFL(1, lineage_0.minimum, { from: authorized })

                    return assertRevert(async () => {
                        await api.sortRFI(1, RFI_SORTING.MERGE, { from: unauthorized })
                    })
                })
            })
        })
    })

    context('Requests For Lineage | RFL', () => {
        context('#accept', () => {
            context('sender has VALUATE_RFL_ROLE', () => {
                context('and Request For Lineage is pending', () => {
                    context('and amount is superior or equal to minimum', () => {
                        it('should succeed to valuate Request For Lineage', async () => {
                            await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                            await api.valuateRFL(1, lineage_0.minimum, { from: authorized })

                            const RFL = await api.getRFL(1)

                            assert.equal(RFL.amount, lineage_0.minimum)
                            assert.equal(RFL.state, RFL_STATE.VALUATED)
                        })
                    })

                    context('but amount is inferior to minimum', () => {
                        it('should revert', async () => {
                            await api.createRFI(individuation_abi, [lineage_1_abi], { from: authorized })

                            return assertRevert(async () => {
                                await api.valuateRFL(1, lineage_1.minimum - 1)
                            })
                        })
                    })
                })

                context('but Request For Lineage is not pending anymore', () => {
                    it('should revert', async () => {
                        await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                        await api.valuateRFL(1, lineage_0.minimum, { from: authorized })

                        // RFL is already valuated and thus not pending anymore
                        return assertRevert(async () => {
                            await api.valuateRFL(1, lineage_0.minimum, { from: authorized })
                        })
                    })
                })
            })

            context('sender does not have VALUATE_RFL_ROLE', () => {
                it('should revert', async () => {
                    await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })

                    return assertRevert(async () => {
                        await api.valuateRFL(1, lineage_0.minimum, { from: unauthorized })
                    })
                })
            })
        })

        context('#reject', () => {
            context('sender has REJECT_RFL_ROLE', () => {
                context('and Request For Lineage is pending', () => {
                    it('should succeed to reject Request For Lineage', async () => {
                        await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                        await api.rejectRFL(1,{ from: authorized })

                        const RFL = await api.getRFL(1)

                        assert.equal(RFL.state, RFL_STATE.REJECTED)
                    })

                    it('should cancel related Request For Individuation', async () => {
                        await api.createRFI(individuation_abi, [lineage_0_abi, lineage_1_abi], { from: authorized })
                        await api.rejectRFL(1,{ from: authorized })

                        const RFI = await api.getRFI(1)

                        assert.equal(RFI.state, RFI_STATE.CANCELLED)
                    })

                    it('should cancel related Requests For Lineage', async () => {
                        await api.createRFI(individuation_abi, [lineage_0_abi, lineage_1_abi], { from: authorized })
                        await api.rejectRFL(1, { from: authorized })

                        const RFL = await api.getRFL(2)

                        assert.equal(RFL.state, RFL_STATE.CANCELLED)
                    })
                })

                context('but Request For Lineage is not pending anymore', () => {
                    it('should revert', async () => {
                        await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })
                        await api.valuateRFL(1, lineage_0.minimum, { from: authorized })

                        // RFL is already valuated and thus not pending anymore
                        return assertRevert(async () => {
                            await api.rejectRFL(1, { from: authorized })
                        })
                    })
                })
            })

            context('sender does not have REJECT_RFL_ROLE', () => {
                it('should revert', async () => {
                    await api.createRFI(individuation_abi, [lineage_0_abi], { from: authorized })

                    return assertRevert(async () => {
                        await api.rejectRFL(1, { from: unauthorized })
                    })
                })
            })
        })
    })
})
