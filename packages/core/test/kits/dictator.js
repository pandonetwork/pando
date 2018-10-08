const Kernel          = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL             = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory      = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const MiniMeToken     = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')
const PandoHistory    = artifacts.require('PandoHistory')
const PandoAPI        = artifacts.require('PandoAPI')
const PandoLineage    = artifacts.require('PandoLineage')
const DictatorKit     = artifacts.require('DictatorKit')


const { ADDR_NULL }    = require('../helpers/address')
const { HASH_NULL }    = require('../helpers/hash')
const { RFI_STATE }    = require('../helpers/state')
const { RFL_STATE }    = require('../helpers/state')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const blocknumber      = require('@aragon/test-helpers/blockNumber')(web3)

contract('DictatorKit', accounts => {
    let factory, token, history, lineage, api, kit

    const root         = accounts[0]
    const origin       = accounts[1]
    const dependency   = accounts[2]
    const dictator     = accounts[3]
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
        const receipt_2 = await dao.newAppInstance('0x0001', (await PandoHistory.new()).address, { from: root })
        const history   = await PandoHistory.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await history.initialize()
        // Lineage
        const receipt_3 = await dao.newAppInstance('0x0002', (await PandoLineage.new()).address, { from: root })
        const lineage   = await PandoLineage.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await token.changeController(lineage.address)
        await lineage.initialize(token.address)
        // API
        const receipt_4 = await dao.newAppInstance('0x0003', (await PandoAPI.new()).address, { from: root })
        const api       = await PandoAPI.at(receipt_4.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await api.initialize(history.address, lineage.address, { from: root })
        // Kit
        const receipt_5 = await dao.newAppInstance('0x0004', (await DictatorKit.new()).address, { from: root })
        const kit       = await DictatorKit.at(receipt_5.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await kit.initialize(api.address, { from: root })

        await acl.createPermission(kit.address, api.address, await api.CREATE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.MERGE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.REJECT_RFI_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.ACCEPT_RFL_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.REJECT_RFL_ROLE(), root, { from: root })

        await acl.createPermission(dictator, kit.address, await kit.DICTATOR_ROLE(), root, { from: root })

        await acl.createPermission(api.address, lineage.address, await lineage.MINT_ROLE(), root, { from: root })
        await acl.createPermission(api.address, lineage.address, await lineage.BURN_ROLE(), root, { from: root })

        return { token, history, lineage, api, kit }
    }

    before(async () => {
        const kernel_base = await Kernel.new(true) // petrify immediately
        const acl_base    = await ACL.new()
        const reg_factory = await RegistryFactory.new()

        factory           = await DAOFactory.new(kernel_base.address, acl_base.address, reg_factory.address)
    })

    beforeEach(async () => {
        ;({ token, history, lineage, api, kit } = await deploy())
    })

    context('#initialize', () => {
        it('should initialize api address', async () => {
            const api_address = await kit.api()

            assert.equal(api_address, api.address)
        })

        it('should fail on reinitialization', async () => {
            return assertRevert(async () => {
                await kit.initialize(api.address, { from: root })
            })
        })
    })

    context('Requests For Individuation | RFI', () => {
        context('#create', () => {
            it('should create Request For Individuation', async () => {
                const receipt = await kit.createRFI(individuation_abi, [lineage_0_abi], { from: root })
                const RFIid   = receipt.logs.filter(x => x.event == 'CreateRFI')[0].args.id.toNumber()

                assert.equal(RFIid, 1)
            })
        })

        context('#merge', () => {
            context('sender has DICTATOR_ROLE', () => {
                context('and Request For Individuation is pending', () => {
                    context('and all related Requests For Lineage are accepted', () => {
                        it('should merge Request For Individuation', async () => {
                            await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })
                            await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })
                            await kit.mergeRFI(1, { from: dictator })

                            const RFI = await api.getRFI(1)

                            assert.equal(RFI.state, RFI_STATE.MERGED)
                        })
                    })

                    context('but at least one of the related Requests For Lineage is not accepted', () => {
                        it('should revert', async () => {
                            const receipt = await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })

                            return assertRevert(async () => {
                                await kit.mergeRFI(1, { from: dictator })
                            })
                        })
                    })
                })

                context('but Request For Individuation is not pending anymore', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })
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
                    await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })
                    await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })

                    return assertRevert(async () => {
                        await kit.mergeRFI(1, { from: unauthorized })
                    })
                })
            })
        })

        context('#reject', () => {
            context('sender has DICTATOR_ROLE', () => {
                context('and Request For Individuation is pending', () => {
                    it('should reject Request For Individuation', async () => {
                        await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })
                        await kit.rejectRFI(1, { from: dictator })

                        const RFI = await api.getRFI(1)

                        assert.equal(RFI.state, RFI_STATE.REJECTED)
                    })
                })

                context('but Request For Individuation is not pending anymore', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })
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
                    await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })

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
                context('and Request For Lineage is pending', () => {
                    context('and value is superior or equal to minimum', () => {
                        it('should accept Request For Lineage', async () => {
                            await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })
                            await kit.acceptRFL(1, lineage_0.minimum, { from: dictator })

                            const RFL = await api.getRFL(1)

                            assert.equal(RFL.state, RFL_STATE.ACCEPTED)
                        })

                        it('should update Request For Lineage value', async () => {
                            await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })
                            await kit.acceptRFL(1, 15, { from: dictator })

                            const RFL = await api.getRFL(1)

                            assert.equal(RFL.value, 15)
                        })
                    })

                    context('but value is inferior to minimum', () => {
                        it('should revert', async () => {
                            await kit.createRFI(individuation_abi, [lineage_1_abi], { from: dictator })

                            return assertRevert(async () => {
                                await kit.acceptRFL(1, lineage_1.minimum - 1)
                            })
                        })
                    })
                })

                context('but Request For Lineage is not pending anymore', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })
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
                    await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })

                    return assertRevert(async () => {
                        await kit.acceptRFL(1, lineage_0.minimum, { from: unauthorized })
                    })
                })
            })
        })

        context('#reject', () => {
            context('sender has DICTATOR_ROLE', () => {
                context('and Request For Lineage is pending', () => {
                    it('should reject Request For Lineage', async () => {
                        await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })
                        await kit.rejectRFL(1,{ from: dictator })

                        const RFL = await api.getRFL(1)

                        assert.equal(RFL.state, RFL_STATE.REJECTED)
                    })
                })

                context('but Request For Lineage is not pending anymore', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })
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
                    await kit.createRFI(individuation_abi, [lineage_0_abi], { from: dictator })

                    return assertRevert(async () => {
                        await kit.rejectRFL(1, { from: unauthorized })
                    })
                })
            })
        })
    })
})
