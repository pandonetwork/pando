const Branch    = artifacts.require('Branch')
const BranchKit = artifacts.require('BranchKit')
const DummyKit  = artifacts.require('DummyKit')

const { assertRevert }   = require('@aragon/test-helpers/assertThrow')
const getBlockNumber     = require('@aragon/test-helpers/blockNumber')(web3)
const { NULL_ADDR }      = require('../helpers/address')
const { deploySpecimen } = require('../helpers/specimen')
const {
    RFC_STATUS,
    RFC_STATE,
    RFC_SORTING,
    submittedRFCId,
    sortedRFCCommitId }  = require('../helpers/rfc')

contract('DummyKit', accounts => {
    let token, dao, specimen, kit, master

    const root         = accounts[0]
    const origin       = accounts[1]
    const dummy        = accounts[2]
    const unauthorized = accounts[3]
    const parents      = web3.eth.abi.encodeParameters(['address'], [NULL_ADDR])
    const parameters   = web3.eth.abi.encodeParameters(['address'], [dummy])

    const deploy = async () => {
        ;({ token, dao, specimen } = await deploySpecimen(root))

        const receipt_1 = await dao.newAppInstance('0x0003', (await DummyKit.new()).address, { from: root })
        const kit       = await DummyKit.at(receipt_1.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

        const receipt_2 = await specimen.createBranch('master', kit.address, parameters, { from: root })
        const master    = await Branch.at(receipt_2.logs.filter(l => l.event == 'CreateBranch')[0].args.proxy)

        return { token, dao, specimen, kit, master }
    }

    beforeEach(async () => {
        ;({ token, dao, specimen, kit, master } = await deploy())
    })

    context('#initialize', () => {
        it('should set branch correctly', async () => {
            const branch = await kit.branch()

            assert.equal(branch, master.address)
        })

        it('should set parameters correctly', async () => {
            const bytes  = await kit.getParameters()
            const params = web3.eth.abi.decodeParameters(['address'], bytes)

            assert.equal(params[0], dummy)
        })

        it('should revert on reinitialization', async () => {
            return assertRevert(async () => {
                await kit.initialize(master.address, parameters, { from: root })
            })
        })
    })

    context('#valuateRFC', () => {
        let rfcId

        beforeEach(async () => {
            rfcId = submittedRFCId(await kit.submitRFC('awesomeIpfsHash', 'First commit', parents, { from: origin }))
        })

        context('address is dummy', () => {
            it('should succeed to valuate RFC', async () => {
                await kit.valuateRFC(rfcId, 50, { from: dummy })
                const rfc = await master.getRFC(rfcId)

                assert.equal(rfc.state, RFC_STATE.VALUATED)
                assert.equal(rfc.value, 50)
            })
        })

        context('address is not dummy', () => {
            it('should fail to valuate RFC', async () => {
                return assertRevert(async () => {
                    await kit.valuateRFC(rfcId, 50, { from: unauthorized })
                })
            })
        })
    })

    context('#sortRFC', () => {
        let rfcId

        beforeEach(async () => {
            rfcId = submittedRFCId(await kit.submitRFC('awesomeIpfsHash', 'First commit', parents, { from: origin }))
        })

        context('Merge', () => {
            context('address is dummy', () => {
                it('should succeed to merge RFC', async () => {
                    await kit.valuateRFC(rfcId, 50, { from: dummy })
                    await kit.sortRFC(rfcId, RFC_SORTING.MERGE, { from: dummy })
                    const rfc = await master.getRFC(rfcId)

                    assert.equal(rfc.state, RFC_STATE.SORTED)
                    assert.equal(rfc.status, RFC_STATUS.MERGED)
                    assert.equal(rfc.value, 50)
                })

                it('should update head', async () => {
                    await kit.valuateRFC(rfcId, 50, { from: dummy })
                    await kit.sortRFC(rfcId, RFC_SORTING.MERGE, { from: dummy })
                    const rfc = await master.getRFC(rfcId)

                    const hash = web3.utils.soliditySha3(
                        { t: 'address', v: origin },
                        { t: 'uint256', v: (await getBlockNumber()) - 1 },
                        { t: 'string',  v: 'awesomeIpfsHash' },
                        { t: 'string',  v: 'First commit' },
                        { t: 'bytes',   v: parents },
                        { t: 'uint256', v: 50 }
                    )
                    const head = await master.getHead()

                    assert.equal(await master.head(), hash)
                    assert.equal(head.origin, origin)
                    assert.equal(head.block, (await getBlockNumber()) - 1)
                    assert.equal(head.tree, 'awesomeIpfsHash')
                    assert.equal(head.message, 'First commit')
                    assert.equal(head.parents, parents)
                    assert.equal(head.value, 50)
                })
            })

            context('address is not dummy', () => {
                it('should fail to merge RFC', async () => {
                    await kit.valuateRFC(rfcId, 50, { from: dummy })
                    return assertRevert(async () => {
                        await kit.sortRFC(rfcId, RFC_SORTING.MERGE, { from: unauthorized })
                    })
                })
            })
        })

        context('Reject', () => {
            context('address is dummy', () => {
                it('should succeed to merge RFC', async () => {
                    await kit.sortRFC(rfcId, RFC_SORTING.REJECT, { from: dummy })
                    const rfc = await master.getRFC(rfcId)

                    assert.equal(rfc.state, RFC_STATE.SORTED)
                    assert.equal(rfc.status, RFC_STATUS.REJECTED)
                    assert.equal(rfc.value, 0)
                })
            })

            context('address is not dummy', () => {
                it('should fail to reject RFC', async () => {
                    return assertRevert(async () => {
                        await kit.sortRFC(rfcId, RFC_SORTING.REJECT, { from: unauthorized })
                    })
                })
            })
        })
    })
})
