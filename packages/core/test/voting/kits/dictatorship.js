const sha3 = require('solidity-sha3').default

const { assertRevert } = require('@aragon/test-helpers/assertThrow')

const getBlockNumber = require('@aragon/test-helpers/blockNumber')(web3)

const DAOFactory = artifacts.require('@aragon/os/contracts/factory/DAOFactory')
const EVMScriptRegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const ACL = artifacts.require('@aragon/os/contracts/acl/ACL')
const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel')
const Repository = artifacts.require('Specimen')
const Branch = artifacts.require('Branch')
const Dictatorship = artifacts.require('Dictatorship')
const BranchKit = artifacts.require('BranchKit')

const TokenManager = artifacts.require('@aragon/apps-token-manager/contracts/TokenManager')
const MiniMeToken = artifacts.require('@aragon/os/contracts/lib/minime/MiniMeToken')

const ANY_ADDR = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDR = '0x0000000000000000000000000000000000000000'

const hash_1 = '0x11111111111111111111111111111111'
const hash_2 = '0x22222222222222222222222222222222'

const submittedRFCId = receipt => receipt.logs.filter(x => x.event == 'SubmitRFC')[0].args.rfcId

const sortedRFCCommitId = receipt => {
    if (receipt.logs.filter(x => x.event == 'NewCommit')[0]) {
        return receipt.logs.filter(x => x.event == 'NewCommit')[0].args.commitId
    } else {
        return undefined
    }
}

const RFC_STATUS = ['OPEN', 'MERGED', 'REJECTED', 'CANCELLED'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const RFC_STATE = ['PENDING', 'VALUATED', 'SORTED'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const RFC_SORTING = ['MERGE', 'REJECT'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

contract('Dictatorship Kit', accounts => {
    let factory, token, dao, specimen, kit, master

    const root = accounts[0]
    const author = accounts[1]
    const origin = accounts[2]
    const authorized = accounts[3]
    const unauthorized = accounts[4]
    const parents = web3.eth.abi.encodeParameters(['address', 'bytes32', 'address', 'bytes32'], [authorized, hash_1, author, hash_2])

    const deploy = async () => {
        // MiniMeToken
        const token = await MiniMeToken.new(NULL_ADDR, NULL_ADDR, 0, 'Native Governance Token', 0, 'NGT', false)
        // DAO
        const receipt_1 = await factory.newDAO(root)
        const dao = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        const acl = await ACL.at(await dao.acl())
        await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
        // TokenManager
        const receipt_2 = await dao.newAppInstance('0x0001', (await TokenManager.new()).address, { from: root })
        const tokenManager = await TokenManager.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await acl.createPermission(root, tokenManager.address, await tokenManager.MINT_ROLE(), root, { from: root })
        await acl.createPermission(root, tokenManager.address, await tokenManager.ISSUE_ROLE(), root, { from: root })
        await acl.createPermission(root, tokenManager.address, await tokenManager.ASSIGN_ROLE(), root, { from: root })
        await acl.createPermission(root, tokenManager.address, await tokenManager.REVOKE_VESTINGS_ROLE(), root, { from: root })
        await acl.createPermission(root, tokenManager.address, await tokenManager.BURN_ROLE(), root, { from: root })
        await token.changeController(tokenManager.address)
        await tokenManager.initialize(token.address, false, 0, false)
        // Specimen
        const receipt_3 = await dao.newAppInstance('0x0002', (await Repository.new()).address, { from: root })
        const specimen = await Repository.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await acl.createPermission(root, specimen.address, await specimen.CREATE_BRANCH_ROLE(), root, { from: root })
        await acl.createPermission(root, specimen.address, await specimen.FREEZE_BRANCH_ROLE(), root, { from: root })
        await acl.createPermission(root, specimen.address, await specimen.ISSUE_REWARD_ROLE(), specimen.address, { from: root })
        await specimen.initialize(tokenManager.address)
        await acl.grantPermission(specimen.address, dao.address, await dao.APP_MANAGER_ROLE(), { from: root })
        await acl.grantPermission(specimen.address, tokenManager.address, await tokenManager.MINT_ROLE(), { from: root })
        // Dictatorship kit
        const receipt_4 = await dao.newAppInstance('0x0003', (await Dictatorship.new()).address, { from: root })
        const kit = await Dictatorship.at(receipt_4.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await acl.createPermission(authorized, kit.address, await kit.VALUATE_RFC_ROLE(), root, { from: root })
        await acl.createPermission(authorized, kit.address, await kit.SORT_RFC_ROLE(), root, { from: root })

        // Master branch
        const receipt_5 = await specimen.createBranch('master', kit.address, { from: root })
        const master = await Branch.at(receipt_5.logs.filter(l => l.event == 'CreateBranch')[0].args.proxy)
        await acl.createPermission(ANY_ADDR, master.address, await master.SUBMIT_RFC_ROLE(), root, { from: root })
        // await acl.grantPermission(ANY_ADDR, master.address, await master.SUBMIT_RFC_ROLE(), { from: root })

        // await acl.createPermission(authorized, master.address, await master.VALUATE_RFC_ROLE(), root, { from: root })
        // await acl.createPermission(authorized, master.address, await master.SORT_RFC_ROLE(), root, { from: root })

        return { token, dao, specimen, kit, master }
    }

    before(async () => {
        const kernelBase = await Kernel.new()
        const aclBase = await ACL.new()
        const regFact = await EVMScriptRegistryFactory.new()
        factory = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)
    })

    beforeEach(async () => {
        ;({ token, dao, specimen, kit, master } = await deploy())
    })

    context('#initialize', () => {
        it('should set specimen and name properly', async () => {
            const spec = await master.specimen()
            const name = await master.name()

            assert.equal(spec, specimen.address)
            assert.equal(name, 'master')
        })

        it('should revert on reinitialization', async () => {
            return assertRevert(async () => {
                await master.initialize(specimen.address, kit.address, 'dev', { from: root })
            })
        })
    })

    context('#valuateRFC', () => {
        let rfcId

        beforeEach(async () => {
            rfcId = submittedRFCId(await master.submitRFC('awesomeIpfsHash', 'First commit', parents, { from: origin }))
        })

        context('address has VALUATE_RFC_ROLE', () => {
            it('should succeed to valuate RFC', async () => {
                await kit.valuateRFC(rfcId, 50, { from: authorized })
                const rfc = await master.getRFC(rfcId)

                assert.equal(rfc.state, RFC_STATE.VALUATED)
                assert.equal(rfc.value, 50)
            })
        })

        context('address do not have VALUATE_RFC_ROLE', () => {
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
            rfcId = submittedRFCId(await master.submitRFC('awesomeIpfsHash', 'First commit', parents, { from: origin }))
        })

        context('Merge', () => {
            context('address has SORT_RFC_ROLE', () => {
                it('should succeed to merge RFC', async () => {
                    await kit.valuateRFC(rfcId, 50, { from: authorized })
                    await kit.sortRFC(rfcId, RFC_SORTING.MERGE, { from: authorized })
                    const rfc = await master.getRFC(rfcId)

                    assert.equal(rfc.state, RFC_STATE.SORTED)
                    assert.equal(rfc.status, RFC_STATUS.MERGED)
                    assert.equal(rfc.value, 50)
                })

                it('should update head', async () => {
                    await kit.valuateRFC(rfcId, 50, { from: authorized })
                    await kit.sortRFC(rfcId, RFC_SORTING.MERGE, { from: authorized })
                    const rfc = await master.getRFC(rfcId)

                    const hash = web3.utils.soliditySha3(
                        { t: 'address', v: origin },
                        { t: 'uint256', v: (await getBlockNumber()) - 1 },
                        { t: 'string', v: 'awesomeIpfsHash' },
                        { t: 'string', v: 'First commit' },
                        { t: 'bytes', v: parents },
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

            context('address does not have SORT_RFC_ROLE', () => {
                it('should fail to merge RFC', async () => {
                    await kit.valuateRFC(rfcId, 50, { from: authorized })
                    return assertRevert(async () => {
                        await kit.sortRFC(rfcId, RFC_SORTING.MERGE, { from: unauthorized })
                    })
                })
            })
        })

        context('Reject', () => {
            context('address has SORT_RFC_ROLE', () => {
                it('should succeed to merge RFC', async () => {
                    // await kit.valuateRFC(rfcId, 50, { from: authorized })
                    await kit.sortRFC(rfcId, RFC_SORTING.REJECT, { from: authorized })
                    const rfc = await master.getRFC(rfcId)

                    assert.equal(rfc.state, RFC_STATE.SORTED)
                    assert.equal(rfc.status, RFC_STATUS.REJECTED)
                    assert.equal(rfc.value, 0)
                })
            })

            context('address does not have SORT_RFC_ROLE', () => {
                it('should fail to reject RFC', async () => {
                    return assertRevert(async () => {
                        await kit.sortRFC(rfcId, RFC_SORTING.REJECT, { from: unauthorized })
                    })
                })
            })
        })

        // context('Reject', () => {
        //     it("should succeed to reject rfc if rfc is open and address is granted 'HANDLE_RFC_ROLE'", async () => {
        //         await master.sortRFC(rfcId, RFC_SORTING.REJECT, { from: authorized })
        //
        //         const rfc = await master.getRFC(rfcId)
        //
        //         assert.equal(rfc.state, RFC_STATE.SORTED)
        //         assert.equal(rfc.status, RFC_STATUS.REJECTED)
        //     })
        //
        //     it("should fail to reject rfc if address is not granted 'HANDLE_RFC_ROLE' even if rfc is open", async () => {
        //         return assertRevert(async () => {
        //             await master.sortRFC(rfcId, RFC_SORTING.REJECT, { from: unauthorized })
        //         })
        //     })
        //
        //     it("should fail to reject rfc if rfc is not open even if address is granted 'HANDLE_RFC_ROLE'", async () => {
        //         await master.sortRFC(rfcId, RFC_SORTING.REJECT, { from: authorized })
        //         // rfc is already rejected and thus not open anymore
        //         return assertRevert(async () => {
        //             await master.sortRFC(rfcId, RFC_SORTING.REJECT, { from: authorized })
        //         })
        //     })
        // })
    })
})
