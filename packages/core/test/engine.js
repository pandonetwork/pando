const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel')
const ACL = artifacts.require('@aragon/os/contracts/acl/ACL')
const EVMScriptRegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory = artifacts.require('@aragon/os/contracts/factory/DAOFactory')
const MiniMeToken = artifacts.require('@aragon/os/contracts/lib/minime/MiniMeToken')
const LineageVoting = artifacts.require('LineageVoting')
const ExecutionTarget = artifacts.require('ExecutionTarget')
const Pando = artifacts.require('Pando')
const PandoHistory = artifacts.require('PandoHistory')
const PandoKit = artifacts.require('PandoKit')
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




contract('PandoEngine', accounts => {
    let factory, token, app, executionTarget, history, engine

    const votingTime = 1000
    const root = accounts[0]
    const origin = accounts[1]
    const dependency = accounts[2]


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
        const dao = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        const acl = await ACL.at(await dao.acl())
        await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })


        // TokenManager
        const receipt_2    = await dao.newAppInstance('0x0001', (await TokenManager.new()).address, { from: root })
        const tokenManager = await TokenManager.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await acl.createPermission(root, tokenManager.address, await tokenManager.MINT_ROLE(), root, { from: root })
        await acl.createPermission(root, tokenManager.address, await tokenManager.ISSUE_ROLE(), root, { from: root })
        await acl.createPermission(root, tokenManager.address, await tokenManager.ASSIGN_ROLE(), root, { from: root })
        await acl.createPermission(root, tokenManager.address, await tokenManager.REVOKE_VESTINGS_ROLE(), root, { from: root })
        await acl.createPermission(root, tokenManager.address, await tokenManager.BURN_ROLE(), root, { from: root })
        await token.changeController(tokenManager.address)
        await tokenManager.initialize(token.address, false, 0, false)

        const receipt_4 = await dao.newAppInstance('0x0002', (await PandoHistory.new(_)).address, { from: root })
        const history   = await PandoHistory.at(receipt_4.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await history.initialize()

        const receipt_5 = await dao.newAppInstance('0x4321', (await PandoAPI.new(_)).address, { from: root })
        const engine       = await PandoAPI.at(receipt_5.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await engine.initialize(history.address, { from: root })


        executionTarget = await ExecutionTarget.new()

        return { token, app, executionTarget, history, engine }
    }

    before(async () => {
        const kernelBase = await Kernel.new()
        const aclBase = await ACL.new()
        const regFact = await EVMScriptRegistryFactory.new()
        factory = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)
    })

    beforeEach(async () => {
        ;({ token, app, executionTarget, history, engine } = await deploy())
    })

    context('#initialize', () => {
        const holder19 = accounts[0]
        const holder31 = accounts[1]
        const holder50 = accounts[2]
        const nonHolder = accounts[4]

        const minimumParticipationPct = pct16(20)

        beforeEach(async () => {
            // token = await MiniMeToken.new(NULL_ADDRESS, NULL_ADDRESS, 0, 'n', 0, 'n', true) // empty parameters minime

            await token.generateTokens(holder19, 19)
            await token.generateTokens(holder31, 31)
            await token.generateTokens(holder50, 50)

            await app.initialize()
        })


        it('should fail on reinitialization', async () => {
            return assertRevert(async () => {
                await engine.initialize(history.address, { from: root })
            })
        })

    })

    context('#createRFI', () => {

        context('address has CREATE_RFI_ROLE', () => {
            it('should succeed to create RFI', async () => {
                const receipt = await engine.createRFI(individuation_abi, [alliance_0_abi])
                const RFIid   = createdRFIid(receipt)

                assert.equal(RFIid, 1)
            })

            it('should initialize RFI correctly', async () => {
                const receipt = await engine.createRFI(individuation_abi, [alliance_0_abi, alliance_1_abi])
                const RFIid   = createdRFIid(receipt)
                const RFI     = await engine.getRFI(RFIid)

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

            it('should initialize related RFAs correctly', async () => {
                await engine.createRFI(individuation_abi, [alliance_0_abi])
                await engine.createRFI(individuation_abi, [alliance_1_abi])

                const RFA_1   = await engine.getRFA(1)
                const RFA_2   = await engine.getRFA(2)

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



    })


    context('#valuateRFA', () => {
        context('sender has VALUATE_RFA_ROLE', () => {
            context('RFA is pending', () => {
                context('amount is superior or equal to minimum', () => {
                    it('should succeed to valuate RFA', async () => {
                        await engine.createRFI(individuation_abi, [alliance_0_abi])
                        await engine.valuateRFA(1, alliance_0.minimum)

                        const RFA = await engine.getRFA(1)

                        assert.equal(RFA.amount, alliance_0.minimum)
                        assert.equal(RFA.state, RFA_STATE.VALUATED)
                    })
                })

                context('amount is inferior to minimum', () => {
                    it('should revert', async () => {
                        await engine.createRFI(individuation_abi, [alliance_1_abi])

                        return assertRevert(async () => {
                            await engine.valuateRFA(1, alliance_1.minimum - 1)
                        })
                    })
                })
            })

            context('RFA is not pending anymore', () => {
                it('should revert', async () => {
                    await engine.createRFI(individuation_abi, [alliance_0_abi])
                    await engine.valuateRFA(1, alliance_0.minimum)

                    // RFA is already valuated and thus not pending anymore
                    return assertRevert(async () => {
                        await engine.valuateRFA(1, alliance_0.minimum)
                    })
                })
            })
        })

        context('sender does not have VALUATE_RFA_ROLE', () => {
            it('should revert', async () => {})
        })
    })

    context('#sortRFI', () => {
        context('sender has SORT_RFI_ROLE', () => {
            context('RFI is pending', () => {
                context('Merge', () => {
                    context('all related RFAs are valuated', () => {
                        it('should sort RFI', async () => {
                            const receipt = await engine.createRFI(individuation_abi, [alliance_0_abi])

                            await engine.valuateRFA(1, alliance_0.minimum)
                            await engine.sortRFI(1, RFI_SORTING.MERGE)

                            const RFI  = await engine.getRFI(1)

                            assert.equal(RFI.state, RFI_STATE.MERGED)
                        })

                        it('should update head', async () => {
                            const receipt = await engine.createRFI(individuation_abi, [alliance_0_abi])

                            await engine.valuateRFA(1, alliance_0.minimum)
                            await engine.sortRFI(1, RFI_SORTING.MERGE)

                            const RFI  = await engine.getRFI(1)
                            const head = await engine.head()


                            // struct Individuation {
                            //     address origin;
                            //     uint256 blockstamp;
                            //     string  tree;
                            //     string  message;
                            //     string  metadata;
                            //     IID[]   parents;
                            // }

                            const hash = await engine.getIndividuationHash([origin, await getBlockNumber(), 'QwAwesomeIPFSHash', 'First individuation', '0x1987', [iid_0_abi]])



                            assert.equal(head, hash)
                        })

                        it('should issue alliances', async () => {
                            const receipt = await engine.createRFI(individuation_abi, [alliance_0_abi])

                            await engine.valuateRFA(1, alliance_0.minimum)
                            await engine.sortRFI(1, RFI_SORTING.MERGE)

                            const RFI  = await engine.getRFI(1)


                            const balance = await token.balanceOf(origin)


                            assert.equal(RFI.state, RFI_STATE.MERGED)

                            console.log(head)


                            // vérifier aussi que les thunes ont été versées


                            // const hash = web3.utils.soliditySha3(
                            //     { t: 'address', v: origin },
                            //     { t: 'uint256', v: (await getBlockNumber()) - 1 },
                            //     { t: 'string', v: 'awesomeIpfsHash' },
                            //     { t: 'string', v: 'First commit' },
                            //     { t: 'bytes', v: parents },
                            //     { t: 'uint256', v: 50 }

                            // calculer le hash de RFI pour vérifier que head est à jour

                        })
                    })

                    context('at least one of the related RFAs is not valuated yet', () => {
                        it('should revert', async () => {
                            const receipt = await engine.createRFI(individuation_abi, [alliance_0_abi])

                            return assertRevert(async () => {
                                await engine.sortRFI(1, RFI_SORTING.MERGE)
                            })
                        })
                    })
                })
                context('Merge', () => {
                })
                context('Cancel', () => {
                })

            })

            context('RFI is not pending anymore', () => {
                it('should revert', async () => {})
            })
        })

        context('sender does not have SORT_RFI_ROLE', () => {
            it('should revert', async () => {})
        })
    })

    // context('isValuePct unit test', async () => {
    //     let votingMock
    //
    //     before(async () => {
    //         votingMock = await getContract('VotingMock').new()
    //     })
    //
    //     it('tests total = 0', async () => {
    //         const result1 = await votingMock.isValuePct(0, 0, pct16(50))
    //         assert.equal(result1, false, 'total 0 should always return false')
    //         const result2 = await votingMock.isValuePct(1, 0, pct16(50))
    //         assert.equal(result2, false, 'total 0 should always return false')
    //     })
    //
    //     it('tests value = 0', async () => {
    //         const result1 = await votingMock.isValuePct(0, 10, pct16(50))
    //         assert.equal(result1, false, 'value 0 should false if pct is non-zero')
    //         const result2 = await votingMock.isValuePct(0, 10, 0)
    //         assert.equal(result2, true, 'value 0 should return true if pct is zero')
    //     })
    // })
})
