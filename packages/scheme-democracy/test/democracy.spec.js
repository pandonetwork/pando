const Kernel          = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL             = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory      = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const MiniMeToken     = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')

const Pando           = artifacts.require('Pando')
const Lineage         = artifacts.require('Lineage')
const Genesis         = artifacts.require('Genesis')
const Organism        = artifacts.require('Organism')

const DemocracyScheme = artifacts.require('DemocracyScheme')

const { ADDR_NULL }    = require('@pando/helpers/address')
const { HASH_NULL }    = require('@pando/helpers/hash')
const { RFI_STATE }    = require('@pando/helpers/state')
const { RFL_STATE }    = require('@pando/helpers/state')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const blocknumber      = require('@aragon/test-helpers/blockNumber')(web3)

const VOTER_STATE = ['ABSENT', 'YEA', 'NAY'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const VOTE_STATE = ['PENDING', 'EXECUTED', 'CANCELLED'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})


contract('DemocracyScheme', accounts => {
    let factory, pando, dao, token, organism_1, organism_2, scheme

    const root       = accounts[0]
    const origin     = accounts[1]
    const dependency = accounts[2]
    const holder20   = accounts[3]
    const holder29   = accounts[4]
    const holder51   = accounts[5]
    const nonHolder  = accounts[6]

    const parameters = { quorum: 50, required: 20 }

    const iid_0             = { organism: ADDR_NULL, hash: HASH_NULL }
    const individuation     = { metadata: 'QwAwesomeIPFSHash' }
    const lineage_0         = { destination: origin, minimum: 0, metadata: '0x1987' }
    const lineage_1         = { destination: dependency, minimum: 15, metadata: '0x1987' }

    const deploy = async () => {
        // Pando Lib
        const pando = await Pando.new()

        // DAO MiniMeToken
        const token = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Governance Token', 0, 'NGT', true)
        await token.generateTokens(holder20, 20)
        await token.generateTokens(holder29, 29)
        await token.generateTokens(holder51, 51)
        // DAO
        const receipt_1 = await factory.newDAO(root)
        const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        const acl       = await ACL.at(await dao.acl())
        await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })

        // Organism_1
        // Lineage token
        const lineage_token_1 = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Lineage Token', 0, 'NLT', true)
        // Lineage
        const receipt_2 = await dao.methods['newAppInstance(bytes32,address)']('0x0011', (await Lineage.new()).address, { from: root })
        const lineage_1 = await Lineage.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // Genesis
        const receipt_3 = await dao.methods['newAppInstance(bytes32,address)']('0x0012', (await Genesis.new()).address, { from: root })
        const genesis_1 = await Genesis.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // Organism
        const receipt_4  = await dao.methods['newAppInstance(bytes32,address)']('0x0013', (await Organism.new()).address, { from: root })
        const organism_1 = await Organism.at(receipt_4.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

        // Organism_2
        // Lineage token
        const lineage_token_2 = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Lineage Token', 0, 'NLT', true)
        // Lineage
        const receipt_5 = await dao.methods['newAppInstance(bytes32,address)']('0x0021', (await Lineage.new()).address, { from: root })
        const lineage_2 = await Lineage.at(receipt_5.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // Genesis
        const receipt_6 = await dao.methods['newAppInstance(bytes32,address)']('0x0022', (await Genesis.new()).address, { from: root })
        const genesis_2 = await Genesis.at(receipt_6.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // Organism
        const receipt_7  = await dao.methods['newAppInstance(bytes32,address)']('0x0023', (await Organism.new()).address, { from: root })
        const organism_2 = await Organism.at(receipt_7.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

        // Scheme
        const receipt_8 = await dao.methods['newAppInstance(bytes32,address)']('0x0001', (await DemocracyScheme.new()).address, { from: root })
        const scheme    = await DemocracyScheme.at(receipt_8.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

        // ACL
        await acl.createPermission(organism_1.address, genesis_1.address, await genesis_1.INDIVIDUATE_ROLE(), root, { from: root })
        await acl.createPermission(organism_1.address, lineage_1.address, await lineage_1.MINT_ROLE(), root, { from: root })
        await acl.createPermission(organism_1.address, lineage_1.address, await lineage_1.BURN_ROLE(), root, { from: root })

        await acl.createPermission(organism_2.address, genesis_2.address, await genesis_2.INDIVIDUATE_ROLE(), root, { from: root })
        await acl.createPermission(organism_2.address, lineage_2.address, await lineage_2.MINT_ROLE(), root, { from: root })
        await acl.createPermission(organism_2.address, lineage_2.address, await lineage_2.BURN_ROLE(), root, { from: root })

        // Grant Permission !

        await acl.createPermission(scheme.address, organism_1.address, await organism_1.CREATE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(scheme.address, organism_1.address, await organism_1.MERGE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(scheme.address, organism_1.address, await organism_1.REJECT_RFI_ROLE(), root, { from: root })
        await acl.createPermission(scheme.address, organism_1.address, await organism_1.ACCEPT_RFL_ROLE(), root, { from: root })
        await acl.createPermission(scheme.address, organism_1.address, await organism_1.REJECT_RFL_ROLE(), root, { from: root })

        // await acl.createPermission(scheme.address, organism_2.address, await organism_2.CREATE_RFI_ROLE(), root, { from: root })
        // await acl.createPermission(scheme.address, organism_2.address, await organism_2.MERGE_RFI_ROLE(), root, { from: root })
        // await acl.createPermission(scheme.address, organism_2.address, await organism_2.REJECT_RFI_ROLE(), root, { from: root })
        // await acl.createPermission(scheme.address, organism_2.address, await organism_2.ACCEPT_RFL_ROLE(), root, { from: root })
        // await acl.createPermission(scheme.address, organism_2.address, await organism_2.REJECT_RFL_ROLE(), root, { from: root })

        // Initialization
        await lineage_token_1.changeController(lineage_1.address)
        await lineage_1.initialize(lineage_token_1.address)

        await lineage_token_2.changeController(lineage_2.address)
        await lineage_2.initialize(lineage_token_2.address)

        await genesis_1.initialize(pando.address)
        await genesis_2.initialize(pando.address)

        await organism_1.initialize(pando.address, genesis_1.address, lineage_1.address, { from: root })
        await organism_2.initialize(pando.address, genesis_2.address, lineage_2.address, { from: root })

        await scheme.initialize(token.address, parameters.quorum, parameters.required, { from: root })

        return { pando, dao, token, organism_1, organism_2, scheme }
    }

    before(async () => {
        const kernel_base = await Kernel.new(true) // petrify immediately
        const acl_base    = await ACL.new()
        const reg_factory = await RegistryFactory.new()
        factory           = await DAOFactory.new(kernel_base.address, acl_base.address, reg_factory.address)
    })

    beforeEach(async () => {
        ;({ pando, dao, token, organism_1, organism_2, scheme } = await deploy())
    })

    context('#initialize', () => {
        context('parameters are in bound', () => {
            it('it should initialize scheme', async () => {
                const token_       = await scheme.token()
                const quorum      = await scheme.quorum()
                const required    = await scheme.required()

                assert.equal(token_, token.address)
                assert.equal(quorum, parameters.quorum)
                assert.equal(required, parameters.required)
            })

            it('it should revert on reinitialization', async () => {
                return assertRevert(async () => {
                    await scheme.initialize(token.address, parameters.quorum, parameters.required, { from: root })
                })
            })
        })

        context('parameters are out of bound', () => {
            it('it should revert', async () => {
                const receipt = await dao.methods['newAppInstance(bytes32,address)']('0x0002', (await DemocracyScheme.new()).address, { from: root })
                const test    = await DemocracyScheme.at(receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

                return assertRevert(async () => {
                    await test.initialize(token.address, 101, parameters.required, { from: root })

                })

                return assertRevert(async () => {
                    await test.initialize(token.address, parameters.quorum, parameters.quorum + 1, { from: root })
                })
            })
        })


    })

    context('Requests For Individuation | RFI', () => {
        context('#create', () => {
            it('it should create RFI', async () => {
                const receipt  = await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                const organism = receipt.logs.filter(x => x.event == 'CreateRFI')[0].args.organism
                const RFIid    = receipt.logs.filter(x => x.event == 'CreateRFI')[0].args.id.toNumber()

                assert.equal(organism, organism_1.address)
                assert.equal(RFIid, 1)
            })

            it('it should create RFI vote', async () => {
                const receipt   = await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                const RFIVoteId = receipt.logs.filter(x => x.event == 'NewRFIVote')[0].args.id.toNumber()

                assert.equal(RFIVoteId, 1)
            })

            it('it should initialize RFI vote', async () => {
                await scheme.createRFI(organism_1.address,individuation, [lineage_0], { from: nonHolder })

                const vote = await scheme.getRFIVote(organism_1.address, 1)

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

            it('it should create related RFL votes', async () => {
                const receipt     = await scheme.createRFI(organism_1.address, individuation, [lineage_0, lineage_1], { from: nonHolder })
                const organism    = receipt.logs.filter(x => x.event == 'NewRFLVote')[0].args.organism
                const RFLVoteId_1 = receipt.logs.filter(x => x.event == 'NewRFLVote')[0].args.id.toNumber()
                const RFLVoteId_2 = receipt.logs.filter(x => x.event == 'NewRFLVote')[1].args.id.toNumber()

                assert.equal(organism, organism_1.address)
                assert.equal(RFLVoteId_1, 1)
                assert.equal(RFLVoteId_2, 2)
            })

            it('it should initialize related RFL votes', async () => {
                await scheme.createRFI(organism_1.address, individuation, [lineage_0, lineage_1], { from: nonHolder })

                const vote_1 = await scheme.getRFLVote(organism_1.address, 1)
                const vote_2 = await scheme.getRFLVote(organism_1.address, 2)

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
                it('it should cast vote', async () => {
                    await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: holder20 })

                    const vote   = await scheme.getRFIVote(organism_1.address, 1)
                    const ballot = await scheme.RFIVotesBallots(organism_1.address, 1, holder20)

                    assert.equal(vote.yea, 20)
                    assert.equal(vote.participation, 20)
                    assert.equal(ballot, VOTER_STATE.YEA)
                })

                context("and sender's stake is superior or equal to quorum", () => {
                    context("and all related RFL are accepted", () => {
                        it('it should execute vote', async () => {
                            await scheme.createRFI(organism_1.address, individuation, [], { from: holder51 })

                            const vote = await scheme.getRFIVote(organism_1.address, 1)

                            assert.equal(vote.state, VOTE_STATE.EXECUTED)
                        })

                        it('it should merge RFI', async () => {
                            await scheme.createRFI(organism_1.address, individuation, [], { from: holder51 })

                            const RFI = await organism_1.getRFI(1)

                            assert.equal(RFI.state, RFI_STATE.MERGED)
                        })
                    })

                    context("but at least one related RFL is not accepted yet", () => {
                        it('it should not execute vote', async () => {
                            await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: holder51 })

                            const vote = await scheme.getRFIVote(organism_1.address, 1)

                            assert.equal(vote.state, VOTE_STATE.PENDING)
                        })
                    })
                })

                context("but sender's stake is inferior to quorum", () => {
                    it('it should not execute vote', async () => {
                        await scheme.createRFI(organism_1.address, individuation, [], { from: holder20 })

                        const vote = await scheme.getRFIVote(organism_1.address, 1)

                        assert.equal(vote.state, VOTE_STATE.PENDING)
                    })
                })
            })

            context('sender is not holder', () => {
                it('it should not cast vote', async () => {
                    await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })

                    const vote   = await scheme.getRFIVote(organism_1.address, 1)
                    const ballot = await scheme.RFIVotesBallots(organism_1.address, 1, holder20)

                    assert.equal(vote.yea, 0)
                    assert.equal(vote.participation, 0)
                    assert.equal(ballot, VOTER_STATE.ABSENT)
                })
            })
        })

        context('#merge', () => {
            context('RFI exists', () => {
                context('and sender is holder', () => {
                    context('and RFI is pending', () => {
                        it('it should cast vote', async () => {
                            await scheme.createRFI(organism_1.address, individuation, [], { from: nonHolder })
                            await scheme.mergeRFI(organism_1.address, 1, { from: holder29 })

                            const vote   = await scheme.getRFIVote(organism_1.address, 1)
                            const ballot = await scheme.RFIVotesBallots(organism_1.address, 1, holder29)

                            assert.equal(vote.yea, 29)
                            assert.equal(vote.participation, 29)
                            assert.equal(ballot, VOTER_STATE.YEA)
                        })

                        context("and participation is superior or equal to quorum", () => {
                            context("and all related RFL are accepted", () => {
                                it('it should execute vote', async () => {
                                    await scheme.createRFI(organism_1.address, individuation, [], { from: nonHolder })
                                    await scheme.mergeRFI(organism_1.address, 1, { from: holder51 })

                                    const vote = await scheme.getRFIVote(organism_1.address, 1)

                                    assert.equal(vote.state, VOTE_STATE.EXECUTED)
                                })

                                it('it should merge RFI', async () => {
                                    await scheme.createRFI(organism_1.address, individuation, [], { from: nonHolder })
                                    await scheme.mergeRFI(organism_1.address, 1, { from: holder51 })

                                    const RFI = await organism_1.getRFI(1)

                                    assert.equal(RFI.state, RFI_STATE.MERGED)
                                })
                            })

                            context("and at least one related RFL is not accepted yet", () => {
                                it('it should not execute vote', async () => {
                                    await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                    await scheme.mergeRFI(organism_1.address, 1, { from: holder51 })

                                    const vote = await scheme.getRFIVote(organism_1.address, 1)

                                    assert.equal(vote.state, VOTE_STATE.PENDING)
                                })
                            })
                        })

                        context("but participation is inferior to quorum", () => {
                            it('it should not execute vote', async () => {
                                await scheme.createRFI(organism_1.address, individuation, [], { from: nonHolder })
                                await scheme.mergeRFI(organism_1.address, 1, { from: holder29 })

                                const vote = await scheme.getRFIVote(organism_1.address, 1)

                                assert.equal(vote.state, VOTE_STATE.PENDING)
                            })
                        })
                    })

                    context('but RFI is not pending anymore', () => {
                        it('it should revert', async () => {
                            await scheme.createRFI(organism_1.address, individuation, [], { from: nonHolder })
                            await scheme.mergeRFI(organism_1.address, 1, { from: holder51 })

                            // RFI is already merged and thus not pending anymore
                            return assertRevert(async () => {
                                await scheme.mergeRFI(organism_1.address, 1, { from: holder20 })
                            })
                        })
                    })
                })

                context('but sender is not holder', () => {
                    it('it should revert', async () => {
                        await scheme.createRFI(organism_1.address, individuation, [], { from: nonHolder })

                        return assertRevert(async () => {
                            await scheme.mergeRFI(organism_1.address, 1, { from: nonHolder })

                        })
                    })
                })
            })

            context('RFI does not exists', () => {
                it('it should revert', async () => {
                    return assertRevert(async () => {
                        await scheme.mergeRFI(organism_1.address, 1, { from: holder20 })

                    })
                })
            })
        })

        context('#reject', () => {
            context('RFI exists', () => {
                context('and sender is holder', () => {
                    context('and RFI is pending', () => {
                        it('it should cast vote', async () => {
                            await scheme.createRFI(organism_1.address, individuation, [], { from: nonHolder })
                            await scheme.rejectRFI(organism_1.address, 1, { from: holder29 })

                            const vote   = await scheme.getRFIVote(organism_1.address, 1)
                            const ballot = await scheme.RFIVotesBallots(organism_1.address, 1, holder29)

                            assert.equal(vote.nay, 29)
                            assert.equal(vote.participation, 29)
                            assert.equal(ballot, VOTER_STATE.NAY)
                        })

                        context("and participation is superior or equal to quorum", () => {
                            it('it should execute vote', async () => {
                                await scheme.createRFI(organism_1.address, individuation, [], { from: nonHolder })
                                await scheme.rejectRFI(organism_1.address, 1, { from: holder51 })

                                const vote = await scheme.getRFIVote(organism_1.address, 1)

                                assert.equal(vote.state, VOTE_STATE.EXECUTED)
                            })

                            it('it should reject RFI', async () => {
                                await scheme.createRFI(organism_1.address, individuation, [], { from: nonHolder })
                                await scheme.rejectRFI(organism_1.address, 1, { from: holder51 })

                                const RFI  = await organism_1.getRFI(1)

                                assert.equal(RFI.state, RFI_STATE.REJECTED)
                            })

                            it('it should cancel related Requests For Lineage votes', async () => {
                                await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                await scheme.rejectRFI(organism_1.address, 1, { from: holder51 })

                                const vote = await scheme.getRFLVote(organism_1.address, 1)

                                assert.equal(vote.state, VOTE_STATE.CANCELLED)
                            })
                        })
                    })

                    context('but RFI is not pending anymore', () => {
                        it('it should revert', async () => {
                            await scheme.createRFI(organism_1.address, individuation, [], { from: nonHolder })
                            await scheme.mergeRFI(organism_1.address, 1, { from: holder51 })

                            // RFI is already merged and thus not pending anymore
                            return assertRevert(async () => {
                                await scheme.rejectRFI(organism_1.address, 1, { from: holder20 })
                            })
                        })
                    })
                })

                context('but sender is not holder', () => {
                    it('it should revert', async () => {
                        await scheme.createRFI(organism_1.address, individuation, [], { from: root })

                        return assertRevert(async () => {
                            await scheme.rejectRFI(organism_1.address, 1, { from: nonHolder })
                        })
                    })
                })
            })

            context('RFI does not exists', () => {
                it('it should revert', async () => {
                    return assertRevert(async () => {
                        await scheme.rejectRFI(organism_1.address, 1, { from: holder20 })

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
                            it('it should cast vote', async () => {
                                await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                await scheme.acceptRFL(organism_1.address, 1, 20, { from: holder29 })

                                const vote   = await scheme.getRFLVote(organism_1.address, 1)
                                const ballot = await scheme.RFLVotesBallots(organism_1.address, 1, holder29)

                                assert.equal(vote.yea, 29)
                                assert.equal(vote.participation, 29)
                                assert.equal(vote.total, 29*20)
                                assert.equal(ballot.state, VOTER_STATE.YEA)
                                assert.equal(ballot.value, 20)
                            })

                            context("and participation is superior or equal to quorum", () => {
                                it('it should execute vote', async () => {
                                    await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                    await scheme.acceptRFL(organism_1.address, 1, 20, { from: holder51 })

                                    const vote = await scheme.getRFLVote(organism_1.address, 1)

                                    assert.equal(vote.state, VOTE_STATE.EXECUTED)
                                })

                                it('it should accept RFL', async () => {
                                    await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                    await scheme.acceptRFL(organism_1.address, 1, 20, { from: holder51 })

                                    const RFL = await organism_1.getRFL(1)

                                    assert.equal(RFL.state, RFL_STATE.ACCEPTED)
                                })

                                it("it should update RFL's value", async () => {
                                    await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                    await scheme.acceptRFL(organism_1.address, 1, 20, { from: holder51 })

                                    const RFL = await organism_1.getRFL(1)

                                    assert.equal(RFL.value, 20)
                                })
                            })

                            context("but participation is inferior to quorum", () => {
                                it('it should not execute vote', async () => {
                                    await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                    await scheme.acceptRFL(organism_1.address, 1, 20, { from: holder20 })

                                    const vote = await scheme.getRFLVote(organism_1.address, 1)

                                    assert.equal(vote.state, VOTE_STATE.PENDING)
                                })
                            })
                        })

                        context('but value is inferior to minimum', () => {
                            it('it should revert', async () => {
                                await scheme.createRFI(organism_1.address, individuation, [lineage_1], { from: nonHolder })

                                return assertRevert(async () => {
                                    await scheme.acceptRFL(organism_1.address, 1, lineage_1.minimum - 1, { from: holder20 })
                                })
                            })
                        })
                    })

                    context('but RFL is not pending anymore', () => {
                        it('it should revert', async () => {
                            await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                            await scheme.acceptRFL(organism_1.address, 1, lineage_0.minimum, { from: holder51 })

                            // RFL is already accepted and thus not pending anymore
                            return assertRevert(async () => {
                                await scheme.acceptRFL(organism_1.address, 1, lineage_0.minimum, { from: holder20 })
                            })
                        })
                    })
                })

                context('but sender is not holder', () => {
                    it('it should revert', async () => {
                        await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })

                        return assertRevert(async () => {
                            await scheme.acceptRFL(organism_1.address, 1, lineage_0.minimum, { from: nonHolder })
                        })
                    })
                })
            })

            context('RFL does not exist', () => {
                it('it should revert', async () => {
                    return assertRevert(async () => {
                        await scheme.acceptRFL(organism_1.address, 2, 50, { from: holder20 })
                    })
                })
            })
        })

        context('#reject', () => {
            context('RFL exists', () => {
                context('and sender is holder', () => {
                    context('and RFL is pending', () => {
                        it('it should cast vote', async () => {
                            await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                            await scheme.rejectRFL(organism_1.address, 1, { from: holder29 })

                            const vote   = await scheme.getRFLVote(organism_1.address, 1)
                            const ballot = await scheme.RFLVotesBallots(organism_1.address, 1, holder29)

                            assert.equal(vote.nay, 29)
                            assert.equal(vote.participation, 29)
                            assert.equal(vote.total, 0)
                            assert.equal(ballot.state, VOTER_STATE.NAY)
                            assert.equal(ballot.value, 0)
                        })

                        context("and participation is superior or equal to quorum", () => {
                            it('it should execute vote', async () => {
                                await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                await scheme.rejectRFL(organism_1.address, 1, { from: holder51 })

                                const vote = await scheme.getRFLVote(organism_1.address, 1)

                                assert.equal(vote.state, VOTE_STATE.EXECUTED)
                            })

                            it('it should reject RFL', async () => {
                                await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                await scheme.rejectRFL(organism_1.address, 1, { from: holder51 })

                                const RFL = await organism_1.getRFL(1)

                                assert.equal(RFL.state, RFL_STATE.REJECTED)
                            })

                            it("it should cancel related RFI's vote", async () => {
                                await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                await scheme.rejectRFL(organism_1.address, 1, { from: holder51 })

                                const vote = await scheme.getRFIVote(organism_1.address, 1)

                                assert.equal(vote.state, VOTE_STATE.CANCELLED)
                            })

                            it("it should cancel related Requests For Lineage's votes", async () => {
                                await scheme.createRFI(organism_1.address, individuation, [lineage_0, lineage_1], { from: nonHolder })
                                await scheme.rejectRFL(organism_1.address, 1, { from: holder51 })

                                const vote = await scheme.getRFLVote(organism_1.address, 2)

                                assert.equal(vote.state, VOTE_STATE.CANCELLED)
                            })
                        })

                        context("but participation is inferior to quorum", () => {
                            it('it should not execute vote', async () => {
                                await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                                await scheme.rejectRFL(organism_1.address, 1, { from: holder20 })

                                const vote = await scheme.getRFLVote(organism_1.address, 1)

                                assert.equal(vote.state, VOTE_STATE.PENDING)
                            })
                        })
                    })

                    context('but RFL is not pending anymore', () => {
                        it('it should revert', async () => {
                            await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })
                            await scheme.rejectRFL(organism_1.address, 1, { from: holder51 })

                            // RFL is already accepted and thus not pending anymore
                            return assertRevert(async () => {
                                await scheme.rejectRFL(organism_1.address, 1, { from: holder20 })
                            })
                        })
                    })
                })

                context('but sender is not holder', () => {
                    it('it should revert', async () => {
                        await scheme.createRFI(organism_1.address, individuation, [lineage_0], { from: nonHolder })

                        return assertRevert(async () => {
                            await scheme.rejectRFL(organism_1.address, 1, { from: nonHolder })
                        })
                    })
                })
            })

            context('RFL does not exist', () => {
                it('it should revert', async () => {
                    return assertRevert(async () => {
                        await scheme.rejectRFL(organism_1.address, 2, { from: holder20 })
                    })
                })
            })
        })
    })
})
