const sha3 = require('solidity-sha3').default

const { assertRevert } = require('@aragon/test-helpers/assertThrow')


const DAOFactory               = artifacts.require('@aragon/os/contracts/factory/DAOFactory')
const EVMScriptRegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const ACL                      = artifacts.require('@aragon/os/contracts/acl/ACL')
const Kernel                   = artifacts.require('@aragon/os/contracts/kernel/Kernel')
const Repository               = artifacts.require('PandoRepository')
const Branch                   = artifacts.require('PandoBranch')
const SpecimenKit             = artifacts.require('SpecimenKit')
const TokenManager = artifacts.require('@aragon/apps-token-manager/contracts/TokenManager');
const MiniMeToken = artifacts.require('@aragon/os/contracts/lib/minime/MiniMeToken')

const ANY_ADDR  = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDR = '0x0000000000000000000000000000000000000000'

const hash_1 = '0x1fffffffffffffffffffffffffffffffffffffff000000000000000000000000'
const hash_2 = '0x2fffffffffffffffffffffffffffffffffffffff000000000000000000000000'


const submittedRequestId = receipt => receipt.logs.filter(x => x.event == 'SubmitRequest')[0].args.requestId
const handledRequestCommitId = receipt => {
    if(receipt.logs.filter(x => x.event == 'NewCommit')[0]) {
        return receipt.logs.filter(x => x.event == 'NewCommit')[0].args.commitId
    } else {
        return undefined
    }
}

const REQUEST_STATE = ['OPEN', 'ACCEPTED', 'REJECTED', 'CANCELLED'].reduce((state, key, index) => {
  state[key] = index
  return state
}, {})

contract('Branch App', accounts => {
    let factory, token, dao, repository, master

    const root         = accounts[0]
    const author       = accounts[1]
    const origin       = accounts[2]
    const authorized   = accounts[3]
    const unauthorized = accounts[4]

    const deploy = async () => {
        // MiniMeToken
        const token     = await MiniMeToken.new(NULL_ADDR, NULL_ADDR, 0, 'Native Governance Token', 0, 'NGT', false)
        // DAO
        const receipt_1 = await factory.newDAO(root)
        const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        const acl       = await ACL.at(await dao.acl())
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
        // Specimen
        const receipt_3  = await dao.newAppInstance('0x0002', (await Repository.new()).address, { from: root })
        const repository = await Repository.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        await acl.createPermission(root, repository.address, await repository.CREATE_BRANCH_ROLE(), root, { from: root })
        await acl.createPermission(root, repository.address, await repository.FREEZE_BRANCH_ROLE(), root, { from: root })
        await acl.createPermission(root, repository.address, await repository.ISSUE_REWARD_ROLE(), repository.address, { from: root })
        await repository.initialize(tokenManager.address)
        await acl.grantPermission(repository.address, dao.address, await dao.APP_MANAGER_ROLE())
        // Master branch
        const receipt_4 = await repository.createBranch('master', { from: root })
        const master    = await Branch.at(receipt_4.logs.filter(l => l.event == 'CreateBranch')[0].args.proxy)

        return { token, dao, repository, master }
    }

    before(async () => {
        const kernelBase = await Kernel.new()
        const aclBase    = await ACL.new()
        const regFact    = await EVMScriptRegistryFactory.new()
        factory          = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)
    })

    beforeEach(async () => {
        ({ token, dao, repository, master } = await deploy())
    })

    context('#initialize', () => {
        it('should revert on reinitialization', async () => {
            const name = await master.name()
            console.log(name)
            return assertRevert(async () => { await master.initialize('dev', { from: root }) })
        })
    })

  // context('#submitRequest', () => {
  //     it("should allow to submit request if address is granted 'SUBMIT_REQUEST_ROLE'", async () => {
  //         const time      = Date.now()
  //         const requestId = submittedRequestId(await branch.submitRequest(root, time, [hash_1, hash_2], 'awesomeIpfsHash', { from: root }))
  //         const request   = await branch.getRequest(requestId)
  //
  //         assert.deepEqual(request.version, ['1', '0', '0'])
  //         assert.equal(request.author, root) // reprendre pour que author et origin ne soit pas les mêmes
  //         assert.equal(request.timestamp, time)
  //         assert.equal(request.parents[0], hash_1)
  //         assert.equal(request.parents[1], hash_2)
  //         assert.equal(request.tree, 'awesomeIpfsHash')
  //         assert.equal(request.origin, root)
  //         // assert.equal(block, ??)
  //         assert.equal(request.value, 0)
  //         assert.equal(request.valuated, false)
  //         assert.equal(request.state, REQUEST_STATE.OPEN)
  //     })
  //
  //     it("should fail to submit request if address is not granted 'SUBMIT_REQUEST_ROLE'", async () => {
  //         return assertRevert(async () => { await branch.submitRequest(unauthorized, Date.now(), [hash_1, hash_2], 'awesomeIpfsHash', { from: unauthorized }) })
  //     })
  // })
  //
  // context('#valuateRequest', () => {
  //     let requestId
  //
  //     const author       = accounts[1]
  //     const origin       = accounts[2]
  //     const authorized   = accounts[3]
  //     const unauthorized = accounts[4]
  //
  //     beforeEach(async () => {
  //       const receipt_1 = await daoFact.newDAO(root)
  //       const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
  //       const acl       = await ACL.at(await dao.acl())
  //
  //       await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
  //
  //       const receipt_2 = await dao.newAppInstance('0x1234', (await Branch.new()).address, { from: root })
  //       branch          = await Branch.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
  //
  //       await branch.initialize('master')
  //       await acl.createPermission(ANY_ADDR, branch.address, await branch.SUBMIT_REQUEST_ROLE(), root, { from: root })
  //       await acl.createPermission(authorized, branch.address, await branch.VALUATE_REQUEST_ROLE(), root, { from: root })
  //
  //       requestId = submittedRequestId(await branch.submitRequest(author, Date.now(), [hash_1, hash_2], 'awesomeIpfsHash', { from: origin }))
  //     })
  //
  //     it("should allow request valuation if request is open and value is zero and address is origin", async () => {
  //         await branch.valuateRequest(requestId, 0, { from: origin })
  //         const request = await branch.getRequest(requestId)
  //
  //         assert.equal(request.valuated, true)
  //         assert.equal(request.value, 0)
  //     })
  //
  //     it("should allow request valuation if request is open and address is granted 'VALUATE_REQUEST_ROLE' whether value is zero or not ", async () => {
  //         await branch.valuateRequest(requestId, 50, { from: authorized })
  //         const request = await branch.getRequest(requestId)
  //
  //         assert.equal(request.valuated, true)
  //         assert.equal(request.value, 50)
  //     })
  //
  //     it("should revert if value is not zero and address is not granted 'VALUATE_REQUEST_ROLE' whether request is open or not", async () => {
  //         return assertRevert(async () => { await branch.valuateRequest(requestId, 50, { from: unauthorized }) })
  //     })
  //
  //     it("should revert if value is not zero and address is not granted 'VALUATE_REQUEST_ROLE' whether request is open or not and whether address is origin or not", async () => {
  //         return assertRevert(async () => { await branch.valuateRequest(requestId, 50, { from: origin }) })
  //     })
  //
  //     // it("should revert if request is closed value is not zero and address is not granted 'VALUATE_REQUEST_ROLE' whether request is open or not and whether address is origin or not", async () => {
  //     //     return assertRevert(async () => { await branch.valuateRequest(requestId, 50, { from: origin }) })
  //     // })
  // })
  //
  //
  // context('#handleRequest', () => {
  //     let requestId
  //
  //     const author       = accounts[1]
  //     const origin       = accounts[2]
  //     const authorized   = accounts[3]
  //     const unauthorized = accounts[4]
  //
  //     beforeEach(async () => {
  //       const receipt_1 = await daoFact.newDAO(root)
  //       const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
  //       const acl       = await ACL.at(await dao.acl())
  //
  //       await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
  //
  //       const receipt_2 = await dao.newAppInstance('0x1234', (await Branch.new()).address, { from: root })
  //       branch          = await Branch.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
  //
  //       await branch.initialize('master')
  //       await acl.createPermission(ANY_ADDR, branch.address, await branch.SUBMIT_REQUEST_ROLE(), root, { from: root })
  //       await acl.createPermission(authorized, branch.address, await branch.VALUATE_REQUEST_ROLE(), root, { from: root })
  //       await acl.createPermission(authorized, branch.address, await branch.HANDLE_REQUEST_ROLE(), root, { from: root })
  //
  //       requestId = submittedRequestId(await branch.submitRequest(author, Date.now(), [hash_1, hash_2], 'awesomeIpfsHash', { from: origin }))
  //     })
  //
  //     it("should allow to accept request if request is open and request is valuated and address is granted 'HANDLE_REQUEST_ROLE'", async () => {
  //         await branch.valuateRequest(requestId, 50, { from: authorized })
  //         const commitId = handledRequestCommitId(await branch.handleRequest(requestId, REQUEST_STATE.ACCEPTED, { from: authorized }))
  //         const request  = await branch.getRequest(requestId)
  //         const commit   = await branch.getCommit(commitId)
  //
  //         assert.equal(commitId, 0)
  //         assert.equal(request.valuated, true)
  //         assert.equal(request.value, 50)
  //         assert.equal(request.state, REQUEST_STATE.ACCEPTED)
  //         assert.deepEqual(commit.version, ['1', '0', '0'])
  //         assert.equal(commit.author, author)
  //         // assert.equal(commit.timestamp, time)
  //         assert.equal(commit.parents[0], hash_1)
  //         assert.equal(commit.parents[1], hash_2)
  //         assert.equal(commit.tree, 'awesomeIpfsHash')
  //         assert.equal(commit.origin, origin)
  //         // assert.equal(block, ??)
  //         assert.equal(commit.value, 50)
  //     })
  //
  //     it("should fail to accept request if request is not valuated even if request is open and address is granted 'HANDLE_REQUEST_ROLE'", async () => {
  //         return assertRevert(async () => { await branch.handleRequest(requestId, REQUEST_STATE.ACCEPTED, { from: authorized }) })
  //     })
  //
  //     it("should fail to accept request if request is not open even if request is valuated and address is granted 'HANDLE_REQUEST_ROLE'", async () => {
  //         await branch.valuateRequest(requestId, 50, { from: authorized })
  //         await branch.handleRequest(requestId, REQUEST_STATE.REJECTED, { from: authorized })
  //         // request is already rejected and thus not open anymore
  //         return assertRevert(async () => { await branch.handleRequest(requestId, REQUEST_STATE.ACCEPTED, { from: authorized }) })
  //     })
  //
  //     it("should fail to accept request if address is not granted 'HANDLE_REQUEST_ROLE' even if request is open and valuated", async () => {
  //         await branch.valuateRequest(requestId, 50, { from: authorized })
  //         return assertRevert(async () => { await branch.handleRequest(requestId, REQUEST_STATE.ACCEPTED, { from: unauthorized }) })
  //     })
  //
  //     it("should allow to reject request if request is open and address is granted 'HANDLE_REQUEST_ROLE' even if request is not valuated", async () => {
  //         const receipt = await branch.handleRequest(requestId, REQUEST_STATE.REJECTED, { from: authorized })
  //         const request = await branch.getRequest(requestId)
  //
  //         assert.deepEqual(receipt.logs.filter(x => x.event == 'NewCommit'), [])
  //         assert.equal(request.state, REQUEST_STATE.REJECTED)
  //     })
  // })

})
