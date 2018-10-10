const Kernel          = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL             = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory      = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const MiniMeToken     = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')
const PandoGenesis    = artifacts.require('PandoGenesis')
const PandoLineage    = artifacts.require('PandoLineage')
const PandoAPI        = artifacts.require('PandoAPI')
const VotingKit       = artifacts.require('VotingKit')


const { ADDR_NULL }    = require('../helpers/address')
const { HASH_NULL }    = require('../helpers/hash')
const { RFI_STATE }    = require('../helpers/state')
const { RFL_STATE }    = require('../helpers/state')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const blocknumber      = require('@aragon/test-helpers/blockNumber')(web3)

const RFI_VOTER_STATE = ['ABSENT', 'YEA', 'NAY'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const VOTE_STATE = ['PENDING', 'EXECUTED', 'CANCELLED'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const pct16 = x => web3.utils.toBN(x).mul(web3.utils.toBN(10).pow(web3.utils.toBN(16)))

contract('VotingKit', accounts => {
    let factory, dao, token, genesis, lineage, api, kit

    const root       = accounts[0]
    const origin     = accounts[1]
    const dependency = accounts[2]
    const holder20   = accounts[3]
    const holder29   = accounts[4]
    const holder51   = accounts[5]
    const nonHolder  = accounts[6]

    const parameters = { quorum: 50, required: 20 }

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
        await token.generateTokens(holder20, 20)
        await token.generateTokens(holder29, 29)
        await token.generateTokens(holder51, 51)
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
        const receipt_5 = await dao.newAppInstance('0x0004', (await VotingKit.new()).address, { from: root })
        const kit       = await VotingKit.at(receipt_5.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

        await acl.createPermission(kit.address, api.address, await api.CREATE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.MERGE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.REJECT_RFI_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.ACCEPT_RFL_ROLE(), root, { from: root })
        await acl.createPermission(kit.address, api.address, await api.REJECT_RFL_ROLE(), root, { from: root })

        await kit.initialize(api.address, parameters.quorum, parameters.required, { from: root })

        return { dao, token, genesis, lineage, api, kit }
    }

    before(async () => {
        const kernel_base = await Kernel.new(true) // petrify immediately
        const acl_base    = await ACL.new()
        const reg_factory = await RegistryFactory.new()

        factory           = await DAOFactory.new(kernel_base.address, acl_base.address, reg_factory.address)
    })

    beforeEach(async () => {
        ;({ dao, token, genesis, lineage, api, kit } = await deploy())
    })

    context('#initialize', () => {
        context('parameters are in bound', () => {
            it('should initialize VotingKit', async () => {
                const api_address = await kit.api()
                const quorum      = await kit.quorum()
                const required    = await kit.required()

                assert.equal(api_address, api.address)
                assert.equal(quorum, parameters.quorum)
                assert.equal(required, parameters.required)
            })

            it('should fail on reinitialization', async () => {
                return assertRevert(async () => {
                    await kit.initialize(api.address, parameters.quorum, parameters.required, { from: root })
                })
            })
        })

        context('parameters are out of bound', () => {
            it('should revert', async () => {
                const receipt = await dao.newAppInstance('0x0005', (await VotingKit.new()).address, { from: root })
                const test    = await VotingKit.at(receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

                return assertRevert(async () => {
                    await test.initialize(api.address, 101, parameters.required, { from: root })

                })
                return assertRevert(async () => {
                    await test.initialize(api.address, parameters.quorum, parameters.quorum + 1, { from: root })
                })
            })
        })


    })

    context('Requests For Individuation | RFI', () => {
        context('#create', () => {
            it('should create RFI', async () => {
                const receipt = await kit.createRFI(individuation_abi, [lineage_0_abi], { from: nonHolder })
                const RFIid   = receipt.logs.filter(x => x.event == 'CreateRFI')[0].args.id.toNumber()

                assert.equal(RFIid, 1)
            })

            it('should create RFI vote', async () => {
                const receipt   = await kit.createRFI(individuation_abi, [lineage_0_abi], { from: nonHolder })
                const RFIVoteId = receipt.logs.filter(x => x.event == 'NewRFIVote')[0].args.id.toNumber()

                assert.equal(RFIVoteId, 1)
            })

            it('should initialize RFI vote', async () => {
                await kit.createRFI(individuation_abi, [lineage_0_abi], { from: nonHolder })

                const vote = await kit.getRFIVote(1)

                assert.equal(vote.RFIid, 1)
                assert.equal(vote.blockstamp, await blocknumber() - 1)
                assert.equal(vote.supply, 100)
                assert.equal(vote.quorum, parameters.quorum)
                assert.equal(vote.required, parameters.required)
                assert.equal(vote.yea, 0)
                assert.equal(vote.nay, 0)
                assert.equal(vote.participation, 0)
                assert.equal(vote.state, VOTE_STATE.PENDING)
            })

            it('should create related RFL votes', async () => {
                const receipt     = await kit.createRFI(individuation_abi, [lineage_0_abi, lineage_1_abi], { from: nonHolder })
                const RFLVoteId_1 = receipt.logs.filter(x => x.event == 'NewRFLVote')[0].args.id.toNumber()
                const RFLVoteId_2 = receipt.logs.filter(x => x.event == 'NewRFLVote')[1].args.id.toNumber()


                assert.equal(RFLVoteId_1, 1)
                assert.equal(RFLVoteId_2, 2)
            })

            it('should initialize related RFL votes', async () => {
                await kit.createRFI(individuation_abi, [lineage_0_abi, lineage_1_abi], { from: nonHolder })

                const vote_1 = await kit.getRFLVote(1)
                const vote_2 = await kit.getRFLVote(2)

                assert.equal(vote_1.RFLid, 1)
                assert.equal(vote_1.blockstamp, await blocknumber() - 1)
                assert.equal(vote_1.supply, 100)
                assert.equal(vote_1.quorum, parameters.quorum)
                assert.equal(vote_1.required, parameters.required)
                assert.equal(vote_1.yea, 0)
                assert.equal(vote_1.nay, 0)
                assert.equal(vote_1.total, 0)
                assert.equal(vote_1.participation, 0)
                assert.equal(vote_1.state, VOTE_STATE.PENDING)

                assert.equal(vote_2.RFLid, 2)
                assert.equal(vote_2.blockstamp, await blocknumber() - 1)
                assert.equal(vote_2.supply, 100)
                assert.equal(vote_2.quorum, parameters.quorum)
                assert.equal(vote_2.required, parameters.required)
                assert.equal(vote_2.yea, 0)
                assert.equal(vote_2.nay, 0)
                assert.equal(vote_2.total, 0)
                assert.equal(vote_2.participation, 0)
                assert.equal(vote_2.state, VOTE_STATE.PENDING)
            })

            context('sender is holder', () => {
                it('should cast vote', async () => {
                    await kit.createRFI(individuation_abi, [lineage_0_abi], { from: holder20 })

                    const vote   = await kit.getRFIVote(1)
                    const ballot = await kit.RFIVotesBallots(1, holder20)

                    assert.equal(vote.yea, 20)
                    assert.equal(vote.participation, 20)
                    assert.equal(ballot, RFI_VOTER_STATE.YEA)
                })

                context("and sender's stake is superior or equal to quorum", () => {
                    context("and all related RFL are accepted", () => {
                        it('should execute vote', async () => {
                            await kit.createRFI(individuation_abi, [], { from: holder51 })

                            const vote = await kit.getRFIVote(1)

                            assert.equal(vote.state, VOTE_STATE.EXECUTED)
                        })

                        it('should merge RFI', async () => {
                            await kit.createRFI(individuation_abi, [], { from: holder51 })

                            const RFI  = await api.getRFI(1)

                            assert.equal(RFI.state, RFI_STATE.MERGED)
                        })
                    })

                    context("but at least one related RFL is not accepted yet", () => {
                        it('should not execute vote', async () => {
                            await kit.createRFI(individuation_abi, [lineage_0_abi], { from: holder51 })

                            const vote = await kit.getRFIVote(1)

                            assert.equal(vote.state, VOTE_STATE.PENDING)
                        })
                    })
                })

                context("but sender's stake is inferior to quorum", () => {
                    it('should not execute vote', async () => {
                        await kit.createRFI(individuation_abi, [], { from: holder20 })

                        const vote = await kit.getRFIVote(1)

                        assert.equal(vote.state, VOTE_STATE.PENDING)
                    })
                })
            })

            context('sender is not holder', () => {
                it('should not cast vote', async () => {
                    await kit.createRFI(individuation_abi, [lineage_0_abi], { from: nonHolder })

                    const vote   = await kit.getRFIVote(1)
                    const ballot = await kit.RFIVotesBallots(1, holder20)

                    assert.equal(vote.yea, 0)
                    assert.equal(vote.participation, 0)
                    assert.equal(ballot, RFI_VOTER_STATE.ABSENT)
                })
            })
        })

        context('#merge', () => {
            context('RFI exists', () => {
                context('and sender is holder', () => {
                    context('and RFI is pending', () => {
                        it('should cast vote', async () => {
                            await kit.createRFI(individuation_abi, [], { from: nonHolder })
                            await kit.mergeRFI(1, { from: holder29 })

                            const vote   = await kit.getRFIVote(1)
                            const ballot = await kit.RFIVotesBallots(1, holder29)

                            assert.equal(vote.yea, 29)
                            assert.equal(vote.participation, 29)
                            assert.equal(ballot, RFI_VOTER_STATE.YEA)
                        })

                        context("and participation is superior or equal to quorum", () => {
                            context("and all related RFL are accepted", () => {
                                it('should execute vote', async () => {
                                    await kit.createRFI(individuation_abi, [], { from: nonHolder })
                                    await kit.mergeRFI(1, { from: holder51 })

                                    const vote = await kit.getRFIVote(1)

                                    assert.equal(vote.state, VOTE_STATE.EXECUTED)
                                })

                                it('should merge RFI', async () => {
                                    await kit.createRFI(individuation_abi, [], { from: nonHolder })
                                    await kit.mergeRFI(1, { from: holder51 })

                                    const RFI  = await api.getRFI(1)

                                    assert.equal(RFI.state, RFI_STATE.MERGED)
                                })
                            })

                            context("and at least one related RFL is not accepted yet", () => {
                                it('should not execute vote', async () => {
                                    await kit.createRFI(individuation_abi, [lineage_0_abi], { from: nonHolder })
                                    await kit.mergeRFI(1, { from: holder51 })

                                    const vote = await kit.getRFIVote(1)

                                    assert.equal(vote.state, VOTE_STATE.PENDING)
                                })
                            })
                        })

                        context("but participation is inferior to quorum", () => {
                            it('should not execute vote', async () => {
                                await kit.createRFI(individuation_abi, [], { from: nonHolder })
                                await kit.mergeRFI(1, { from: holder29 })

                                const vote = await kit.getRFIVote(1)

                                assert.equal(vote.state, VOTE_STATE.PENDING)
                            })
                        })
                    })

                    context('but RFI is not pending anymore', () => {
                        it('should revert', async () => {
                            await kit.createRFI(individuation_abi, [], { from: nonHolder })
                            await kit.mergeRFI(1, { from: holder51 })

                            // RFI is already merged and thus not pending anymore
                            return assertRevert(async () => {
                                await kit.mergeRFI(1, { from: holder20 })
                            })
                        })
                    })
                })

                context('but sender is not holder', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation_abi, [], { from: nonHolder })

                        return assertRevert(async () => {
                            await kit.mergeRFI(1, { from: nonHolder })

                        })
                    })
                })
            })

            context('RFI does not exists', () => {
                it('should revert', async () => {
                    return assertRevert(async () => {
                        await kit.mergeRFI(1, { from: holder20 })

                    })
                })
            })

        })

        context('#reject', () => {
            context('RFI exists', () => {
                context('and sender is holder', () => {
                    context('and RFI is pending', () => {
                        it('should cast vote', async () => {
                            await kit.createRFI(individuation_abi, [], { from: nonHolder })
                            await kit.rejectRFI(1, { from: holder29 })

                            const vote   = await kit.getRFIVote(1)
                            const ballot = await kit.RFIVotesBallots(1, holder29)

                            assert.equal(vote.nay, 29)
                            assert.equal(vote.participation, 29)
                            assert.equal(ballot, RFI_VOTER_STATE.NAY)
                        })

                        context("and participation is superior or equal to quorum", () => {
                            it('should execute vote', async () => {
                                await kit.createRFI(individuation_abi, [], { from: nonHolder })
                                await kit.rejectRFI(1, { from: holder51 })

                                const vote = await kit.getRFIVote(1)

                                assert.equal(vote.state, VOTE_STATE.EXECUTED)
                            })

                            it('should reject RFI', async () => {
                                await kit.createRFI(individuation_abi, [], { from: nonHolder })
                                await kit.rejectRFI(1, { from: holder51 })

                                const RFI  = await api.getRFI(1)

                                assert.equal(RFI.state, RFI_STATE.REJECTED)
                            })

                            it('should cancel related Requests For Lineage votes', async () => {
                                await kit.createRFI(individuation_abi, [lineage_0_abi], { from: nonHolder })
                                await kit.rejectRFI(1, { from: holder51 })

                                const vote = await kit.getRFLVote(1)

                                assert.equal(vote.state, VOTE_STATE.CANCELLED)
                            })
                        })
                    })

                    context('but RFI is not pending anymore', () => {
                        it('should revert', async () => {
                            await kit.createRFI(individuation_abi, [], { from: nonHolder })
                            await kit.mergeRFI(1, { from: holder51 })

                            // RFI is already merged and thus not pending anymore
                            return assertRevert(async () => {
                                await kit.rejectRFI(1, { from: holder20 })
                            })
                        })
                    })
                })

                context('but sender is not holder', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation_abi, [], { from: root })

                        return assertRevert(async () => {
                            await kit.rejectRFI(1, { from: nonHolder })
                        })
                    })
                })
            })

            context('RFI does not exists', () => {
                it('should revert', async () => {
                    return assertRevert(async () => {
                        await kit.rejectRFI(1, { from: holder20 })

                    })
                })
            })
        })
    })

    context('Requests For Lineage | RFL', () => {
        context('#accept', () => {
            context('RFL exists', () => {
                context('and sender is holder', () => {
                    context('and RFL is pending', () => {
                        context('and value is superior or equal to minimum', () => {
                            it('should cast vote', async () => {
                                await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                                await kit.acceptRFL(1, 20, { from: holder29 })

                                const vote   = await kit.getRFLVote(1)
                                const ballot = await kit.RFLVotesBallots(1, holder29)

                                assert.equal(vote.yea, 29)
                                assert.equal(vote.participation, 29)
                                assert.equal(vote.total, 29*20)
                                assert.equal(ballot.state, RFI_VOTER_STATE.YEA)
                                assert.equal(ballot.value, 20)
                            })

                            context("and participation is superior or equal to quorum", () => {
                                it('should execute vote', async () => {
                                    await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                                    await kit.acceptRFL(1, 20, { from: holder51 })

                                    const vote = await kit.getRFLVote(1)

                                    assert.equal(vote.state, VOTE_STATE.EXECUTED)
                                })

                                it('should accept RFL', async () => {
                                    await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                                    await kit.acceptRFL(1, 20, { from: holder51 })

                                    const RFL = await api.getRFL(1)

                                    assert.equal(RFL.state, RFL_STATE.ACCEPTED)
                                })

                                it("should update RFL's value", async () => {
                                    await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                                    await kit.acceptRFL(1, 20, { from: holder51 })

                                    const RFL = await api.getRFL(1)

                                    assert.equal(RFL.value, 20)
                                })
                            })

                            context("but participation is inferior to quorum", () => {
                                it('should not execute vote', async () => {
                                    await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                                    await kit.acceptRFL(1, 20, { from: holder20 })

                                    const vote = await kit.getRFLVote(1)

                                    assert.equal(vote.state, VOTE_STATE.PENDING)
                                })
                            })
                        })

                        context('but value is inferior to minimum', () => {
                            it('should revert', async () => {
                                await kit.createRFI(individuation_abi, [lineage_1_abi], { from: nonHolder })

                                return assertRevert(async () => {
                                    await kit.acceptRFL(1, lineage_1.minimum - 1, { from: holder20 })
                                })
                            })
                        })
                    })

                    context('but RFL is not pending anymore', () => {
                        it('should revert', async () => {
                            await kit.createRFI(individuation_abi, [lineage_0_abi], { from: nonHolder })
                            await kit.acceptRFL(1, lineage_0.minimum, { from: holder51 })

                            // RFL is already accepted and thus not pending anymore
                            return assertRevert(async () => {
                                await kit.acceptRFL(1, lineage_0.minimum, { from: holder20 })
                            })
                        })
                    })
                })

                context('but sender is not holder', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation_abi, [lineage_0_abi], { from: nonHolder })

                        return assertRevert(async () => {
                            await kit.acceptRFL(1, lineage_0.minimum, { from: nonHolder })
                        })
                    })
                })
            })

            context('RFL does not exist', () => {
                it('should revert', async () => {
                    return assertRevert(async () => {
                        await kit.acceptRFL(2, 50, { from: holder20 })
                    })
                })
            })
        })

        context('#reject', () => {
            context('RFL exists', () => {
                context('and sender is holder', () => {
                    context('and RFL is pending', () => {
                        it('should cast vote', async () => {
                            await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                            await kit.rejectRFL(1, { from: holder29 })

                            const vote   = await kit.getRFLVote(1)
                            const ballot = await kit.RFLVotesBallots(1, holder29)

                            assert.equal(vote.nay, 29)
                            assert.equal(vote.participation, 29)
                            assert.equal(vote.total, 0)
                            assert.equal(ballot.state, RFI_VOTER_STATE.NAY)
                            assert.equal(ballot.value, 0)
                        })

                        context("and participation is superior or equal to quorum", () => {
                            it('should execute vote', async () => {
                                await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                                await kit.rejectRFL(1, { from: holder51 })

                                const vote = await kit.getRFLVote(1)

                                assert.equal(vote.state, VOTE_STATE.EXECUTED)
                            })

                            it('should reject RFL', async () => {
                                await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                                await kit.rejectRFL(1, { from: holder51 })

                                const RFL = await api.getRFL(1)

                                assert.equal(RFL.state, RFL_STATE.REJECTED)
                            })

                            it("should cancel related RFI's vote", async () => {
                                await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                                await kit.rejectRFL(1, { from: holder51 })

                                const vote = await kit.getRFIVote(1)

                                assert.equal(vote.state, VOTE_STATE.CANCELLED)
                            })

                            it("should cancel related Requests For Lineage's votes", async () => {
                                await kit.createRFI(individuation_abi, [lineage_0, lineage_1], { from: nonHolder })
                                await kit.rejectRFL(1, { from: holder51 })

                                const vote = await kit.getRFLVote(2)

                                assert.equal(vote.state, VOTE_STATE.CANCELLED)
                            })
                        })

                        context("but participation is inferior to quorum", () => {
                            it('should not execute vote', async () => {
                                await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                                await kit.rejectRFL(1, { from: holder20 })

                                const vote = await kit.getRFLVote(1)

                                assert.equal(vote.state, VOTE_STATE.PENDING)
                            })
                        })
                    })

                    context('but RFL is not pending anymore', () => {
                        it('should revert', async () => {
                            await kit.createRFI(individuation_abi, [lineage_0], { from: nonHolder })
                            await kit.rejectRFL(1, { from: holder51 })

                            // RFL is already accepted and thus not pending anymore
                            return assertRevert(async () => {
                                await kit.rejectRFL(1, { from: holder20 })
                            })
                        })
                    })
                })

                context('but sender is not holder', () => {
                    it('should revert', async () => {
                        await kit.createRFI(individuation_abi, [lineage_0_abi], { from: nonHolder })

                        return assertRevert(async () => {
                            await kit.rejectRFL(1, { from: nonHolder })
                        })
                    })
                })
            })

            context('RFL does not exist', () => {
                it('should revert', async () => {
                    return assertRevert(async () => {
                        await kit.rejectRFL(2, { from: holder20 })
                    })
                })
            })
        })
    })
})
