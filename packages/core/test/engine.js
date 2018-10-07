const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL = artifacts.require('@aragon/core/contracts/acl/ACL')
const EVMScriptRegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const MiniMeToken = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')


const Pando = artifacts.require('Pando')
const PandoHistory = artifacts.require('PandoHistory')
const PandoAPI = artifacts.require('PandoAPI')
const PandoLineage = artifacts.require('PandoLineage')

const getBlockNumber     = require('@aragon/test-helpers/blockNumber')(web3)



const BN = require('bignumber.js')

const { encodeCallScript, EMPTY_SCRIPT } = require('@aragon/test-helpers/evmScript')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')

const timeTravel = s => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: '2.0',
                method: 'evm_increaseTime',
                params: [s],
                id: new Date().getTime()
            },
            function(err) {
                if (err) return reject(err)
                resolve()
            }
        )
    })
}
const pct16 = x => {
    return new BN(x).times(new BN(10).pow(16))
}
const createdVoteId = receipt => receipt.logs.filter(x => x.event == 'StartVote')[0].args.voteId

const ANY_ADDR = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDR = '0x0000000000000000000000000000000000000000'


const RFA_STATE = ['PENDING', 'VALUATED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'ISSUED'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const RFA_SORTING = ['ACCEPT', 'REJECT', 'CANCEL'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const RFI_STATE = ['PENDING', 'MERGED', 'REJECTED', 'CANCELLED'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const RFI_SORTING = ['MERGE', 'REJECT', 'CANCEL'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})


HASH_NULL = '0x0000000000000000000000000000000000000000000000000000000000000000'

const createdRFIid = receipt => receipt.logs.filter(x => x.event == 'CreateRFI')[0].args.id.toNumber()


// struct CID {
//     address engine;
//     bytes32 hash;
// }
//
// struct Commit {
//     address origin;
//     uint256 block;
//     string  tree;
//     string  message;
//     CID[]   parents;
// }
//
// struct RFA {
//     RFAKind  kind;
//     address  receiver;
//     uint256  amount;
//     string   metadata;
//     RFAState state;
//     uint256  RFIid;
// }

const getContract = name => artifacts.require(name)



contract('PandoAPI', accounts => {
    let factory, token, history, lineage, engine

    const root         = accounts[0]
    const origin       = accounts[1]
    const dependency   = accounts[2]
    const authorized   = accounts[3]
    const unauthorized = accounts[4]



    const iid_0 = { api: NULL_ADDR, hash: HASH_NULL}
    const iid_0_abi = [NULL_ADDR, HASH_NULL]

    const individuation = { origin: origin, tree: 'QwAwesomeIPFSHash', message: 'First individuation', metadata: '0x1987', parents: [iid_0] }
    const individuation_abi = [origin, 'QwAwesomeIPFSHash', 'First individuation', '0x1987', [iid_0_abi]]

    const alliance_0 = { destination: origin, minimum: 0, metadata: '0x1987' }
    const alliance_0_abi = [ origin, 0, '0x1987' ]

    const alliance_1 = { destination: dependency, minimum: 15, metadata: '0x1987' }
    const alliance_1_abi = [ dependency, 15, '0x1987' ]

    const deploy = async () => {


        // MiniMeToken
        const token = await MiniMeToken.new(NULL_ADDR, NULL_ADDR, 0, 'Native Lineage Token', 0, 'NLT', true)
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
        //

        // API
        const receipt_5 = await dao.newAppInstance('0x4321', (await PandoAPI.new()).address, { from: root })
        const engine       = await PandoAPI.at(receipt_5.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await engine.initialize(history.address, lineage.address, { from: root })

        await acl.createPermission(authorized, engine.address, await engine.CREATE_RFI_ROLE(), root, { from: root })
        await acl.createPermission(authorized, engine.address, await engine.SORT_RFI_ROLE(), root, { from: root })
        await acl.createPermission(authorized, engine.address, await engine.CREATE_RFL_ROLE(), root, { from: root })
        await acl.createPermission(authorized, engine.address, await engine.VALUATE_RFL_ROLE(), root, { from: root })
        await acl.createPermission(authorized, engine.address, await engine.SORT_RFL_ROLE(), root, { from: root })

        await acl.createPermission(engine.address, lineage.address, await lineage.MINT_ROLE(), root, { from: root })
        await acl.createPermission(engine.address, lineage.address, await lineage.BURN_ROLE(), root, { from: root })




        return { token, history, lineage, engine }
    }

    before(async () => {
        // const kernelBase = await Kernel.new()
        // const aclBase = await ACL.new()
        // const regFact = await EVMScriptRegistryFactory.new()
        // factory = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)

        const kernelBase = await getContract('Kernel').new(true) // petrify immediately
        const aclBase = await getContract('ACL').new()
        const regFact = await EVMScriptRegistryFactory.new()
        factory = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)

    })

    beforeEach(async () => {
        ;({ token, history, lineage, engine } = await deploy())
    })

    context('#initialize', () => {
        it('should initialize genesis and lineage addresses correctly', async () => {
            const genesis_address = await engine.history()
            const lineage_address = await engine.lineage()

            assert.equal(genesis_address, history.address)
            assert.equal(lineage_address, lineage.address)
        })

        it('should fail on reinitialization', async () => {
            return assertRevert(async () => {
                await engine.initialize(history.address, lineage.address, { from: root })
            })
        })
    })

    context('#createRFI', () => {
        context('sender has CREATE_RFI_ROLE', () => {
            it('should succeed to create Request For Individuation', async () => {
                const receipt = await engine.createRFI(individuation_abi, [alliance_0_abi], { from: authorized })
                const RFIid   = createdRFIid(receipt)

                assert.equal(RFIid, 1)
            })

            it('should initialize Request For Individuation correctly', async () => {
                await engine.createRFI(individuation_abi, [alliance_0_abi, alliance_1_abi], { from: authorized })

                const RFI = await engine.getRFI(1)

                assert.equal(RFI.individuation.origin, individuation.origin)
                assert.equal(RFI.individuation.tree, individuation.tree)
                assert.equal(RFI.individuation.message, individuation.message)
                assert.equal(RFI.individuation.metadata, individuation.metadata)
                assert.equal(RFI.individuation.parents[0].api,  individuation.parents[0].api)
                assert.equal(RFI.individuation.parents[0].hash, individuation.parents[0].hash)
                assert.equal(RFI.blockstamp, await getBlockNumber())
                assert.equal(RFI.state, RFI_STATE.PENDING)
                assert.equal(RFI.RFAids[0], 1)
                assert.equal(RFI.RFAids[1], 2)
            })

            it('should initialize related Requests For Lineage correctly', async () => {
                await engine.createRFI(individuation_abi, [alliance_0_abi], { from: authorized })
                await engine.createRFI(individuation_abi, [alliance_1_abi], { from: authorized })

                const RFA_1 = await engine.getRFA(1)
                const RFA_2 = await engine.getRFA(2)

                assert.equal(RFA_1.alliance.destination, alliance_0.destination)
                assert.equal(RFA_1.alliance.minimum, alliance_0.minimum)
                assert.equal(RFA_1.alliance.metadata, alliance_0.metadata)
                assert.equal(RFA_1.blockstamp, await getBlockNumber() - 1)
                assert.equal(RFA_1.state, RFA_STATE.PENDING)
                assert.equal(RFA_1.RFIid, 1)

                assert.equal(RFA_2.alliance.destination, alliance_1.destination)
                assert.equal(RFA_2.alliance.minimum, alliance_1.minimum)
                assert.equal(RFA_2.alliance.metadata, alliance_1.metadata)
                assert.equal(RFA_2.blockstamp, await getBlockNumber())
                assert.equal(RFA_2.state, RFA_STATE.PENDING)
                assert.equal(RFA_2.RFIid, 2)
            })
        })

        context('sender does not have CREATE_RFI_ROLE', () => {
            it('should revert', async () => {
                return assertRevert(async () => {
                    await engine.createRFI(individuation_abi, [alliance_0_abi], { from: unauthorized })
                })
            })
        })
    })

    context('#sortRFI', () => {
        context('sender has SORT_RFI_ROLE', () => {
            context('and Request For Individuation is pending', () => {
                context('and sorting instruction is to merge', () => {
                    context('all related Requests For Lineage are valuated', () => {
                        it('should succeed to merge Request For Individuation', async () => {
                            await engine.createRFI(individuation_abi, [alliance_0_abi], { from: authorized })
                            await engine.valuateRFA(1, alliance_0.minimum, { from: authorized })
                            await engine.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })

                            const RFI = await engine.getRFI(1)

                            assert.equal(RFI.state, RFI_STATE.MERGED)
                        })

                        it('should update genesis head', async () => {
                            await engine.createRFI(individuation_abi, [alliance_0_abi], { from: authorized })
                            await engine.valuateRFA(1, alliance_0.minimum, { from: authorized })
                            await engine.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })

                            const head = await engine.head()
                            const hash = await engine.getIndividuationHash([origin, await getBlockNumber(), 'QwAwesomeIPFSHash', 'First individuation', '0x1987', [iid_0_abi]])

                            assert.equal(head, hash)
                        })

                        it('should mint and assign related lineage', async () => {
                            await engine.createRFI(individuation_abi, [alliance_0_abi, alliance_1_abi], { from: authorized })
                            await engine.valuateRFA(1, 25, { from: authorized })
                            await engine.valuateRFA(2, 45, { from: authorized })
                            await engine.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })
                            await engine.sortRFI(2, RFI_SORTING.MERGE, { from: authorized })

                            const balance_origin     = await token.balanceOf(origin)
                            const balance_dependency = await token.balanceOf(dependency)

                            assert.equal(balance_origin, 25)
                            assert.equal(balance_dependency, 45)
                        })
                    })

                    context('and at least one of the related Requests For Lineage is not valuated', () => {
                        it('should revert', async () => {
                            const receipt = await engine.createRFI(individuation_abi, [alliance_0_abi], { from: authorized })

                            return assertRevert(async () => {
                                await engine.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })
                            })
                        })
                    })
                })

                context('and sorting instruction is to reject', () => {
                    it('should succeed to reject Request For Individuation', async () => {
                        await engine.createRFI(individuation_abi, [alliance_0_abi], { from: authorized })
                        await engine.sortRFI(1, RFI_SORTING.REJECT, { from: authorized })

                        const RFI = await engine.getRFI(1)

                        assert.equal(RFI.state, RFI_STATE.REJECTED)
                    })

                    it('should cancel related Requests For Lineage', async () => {
                        await engine.createRFI(individuation_abi, [alliance_0_abi, alliance_1_abi], { from: authorized })
                        await engine.sortRFI(1, RFI_SORTING.REJECT, { from: authorized })

                        const RFA_1 = await engine.getRFA(1)
                        const RFA_2 = await engine.getRFA(2)

                        assert.equal(RFA_1.state, RFA_STATE.CANCELLED)
                        assert.equal(RFA_2.state, RFA_STATE.CANCELLED)
                    })
                })
            })

            context('and Request For Individuation is not pending anymore', () => {
                it('should revert', async () => {
                    await engine.createRFI(individuation_abi, [alliance_0_abi], { from: authorized })
                    await engine.valuateRFA(1, alliance_0.minimum, { from: authorized })
                    await engine.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })

                    // RFI is already merged and thus not pending anymore
                    return assertRevert(async () => {
                        await engine.sortRFI(1, RFI_SORTING.MERGE, { from: authorized })
                    })
                })
            })
        })

        context('sender does not have SORT_RFI_ROLE', () => {
            it('should revert', async () => {
                await engine.createRFI(individuation_abi, [alliance_0_abi], { from: authorized })
                await engine.valuateRFA(1, alliance_0.minimum, { from: authorized })

                return assertRevert(async () => {
                    await engine.sortRFI(1, RFI_SORTING.MERGE, { from: unauthorized })
                })
            })
        })
    })

    context('#valuateRFA', () => {
        context('sender has VALUATE_RFA_ROLE', () => {
            context('RFA is pending', () => {
                context('amount is superior or equal to minimum', () => {
                    it('should succeed to valuate RFA', async () => {
                        await engine.createRFI(individuation_abi, [alliance_0_abi], { from: authorized })
                        await engine.valuateRFA(1, alliance_0.minimum, { from: authorized })

                        const RFA = await engine.getRFA(1)

                        assert.equal(RFA.amount, alliance_0.minimum)
                        assert.equal(RFA.state, RFA_STATE.VALUATED)
                    })
                })

                context('amount is inferior to minimum', () => {
                    it('should revert', async () => {
                        await engine.createRFI(individuation_abi, [alliance_1_abi], { from: authorized })

                        return assertRevert(async () => {
                            await engine.valuateRFA(1, alliance_1.minimum - 1)
                        })
                    })
                })
            })

            context('RFA is not pending anymore', () => {
                it('should revert', async () => {
                    await engine.createRFI(individuation_abi, [alliance_0_abi], { from: authorized })
                    await engine.valuateRFA(1, alliance_0.minimum, { from: authorized })

                    // RFA is already valuated and thus not pending anymore
                    return assertRevert(async () => {
                        await engine.valuateRFA(1, alliance_0.minimum, { from: authorized })
                    })
                })
            })
        })

        context('sender does not have VALUATE_RFA_ROLE', () => {
            it('should revert', async () => {})
        })
    })


})
