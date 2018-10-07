const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel')
const ACL = artifacts.require('@aragon/os/contracts/acl/ACL')
const EVMScriptRegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory = artifacts.require('@aragon/os/contracts/factory/DAOFactory')
const MiniMeToken = artifacts.require('@aragon/os/contracts/lib/minime/MiniMeToken')
const LineageVoting = artifacts.require('LineageVoting')
const ExecutionTarget = artifacts.require('ExecutionTarget')

const BN = require('bignumber.js')

const { encodeCallScript, EMPTY_SCRIPT } = require('@aragon/test-helpers/evmScript')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const getBlockNumber = require('@aragon/test-helpers/blockNumber')(web3)
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

contract('Voting App', accounts => {
    let factory, token, app, executionTarget

    const votingTime = 1000
    const root = accounts[0]

    const deploy = async () => {
        // MiniMeToken
        const token = await MiniMeToken.new(NULL_ADDR, NULL_ADDR, 0, 'Native Governance Token', 0, 'NGT', true)
        // DAO
        const receipt_1 = await factory.newDAO(root)
        const dao = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        const acl = await ACL.at(await dao.acl())
        await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
        // QuantificationVoting
        const receipt_3 = await dao.newAppInstance('0x1234', (await LineageVoting.new()).address, { from: root })
        app = await LineageVoting.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // await acl.createPermission(ANY_ADDR, app.address, await app.CREATE_VOTES_ROLE(), root, { from: root })
        // await acl.createPermission(ANY_ADDR, app.address, await app.MODIFY_PARTICIPATION_ROLE(), root, { from: root })
        // Execution Target
        executionTarget = await ExecutionTarget.new()

        return { token, app, executionTarget }
    }

    before(async () => {
        const kernelBase = await Kernel.new()
        const aclBase = await ACL.new()
        const regFact = await EVMScriptRegistryFactory.new()
        factory = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)
    })

    beforeEach(async () => {
        ;({ token, app, executionTarget } = await deploy())
    })

    context('normal token supply', () => {
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

        it('fails on reinitialization', async () => {
            const action_1 = { to: executionTarget.address, calldata: executionTarget.contract.methods.setValue(0x44).encodeABI() }
            const action_2 = { to: executionTarget.address, calldata: executionTarget.contract.methods.execute().encodeABI() }
            const action_3 = { to: executionTarget.address, calldata: executionTarget.contract.methods.commit(root, 'QwAwesomeHash', 'First commit', '0x00' ).encodeABI() }

            const script_1 = encodeCallScript([action_1])
            const script_2 = encodeCallScript([action_2])

            const script_3 = encodeCallScript([action_3])

            const sig_1 = web3.eth.abi.encodeFunctionSignature('setValue(uint256)')
            const sig_2 = web3.eth.abi.encodeFunctionSignature('execute()')
            const sig_3 = web3.eth.abi.encodeFunctionSignature('commit(address,string,string,bytes)')



            console.log('Contract address: ' + executionTarget.address)
            console.log('Signature 1: ' + sig_1)
            console.log('Signature 2: ' + sig_2)
            console.log('Signature 3: ' + sig_3)

            // console.log(script_1)

            const receipt = await app.forward(script_3, { from: holder50 })


            console.log('EVMCallScript: ' + script_3)


            console.log('TX Calls: ' + receipt.logs.filter(l => l.event == 'Calls')[0].args.calls)


            console.log('TX Call: ' + receipt.logs.filter(l => l.event == 'Call')[0].args.call)

            console.log('tx Destination' + receipt.logs.filter(l => l.event == 'ContractAddress')[0].args.addr)
            // console.log(receipt.logs.filter(l => l.event == 'Length')[0].args.length)
            // console.log(receipt.logs.filter(l => l.event == 'Signature')[0].args.sig)
            console.log('tx Calldata: ' + receipt.logs.filter(l => l.event == 'Calldata')[0].args.params)

            if(receipt.logs.filter(l => l.event == 'Lineage')[0]) {
                console.log('LINEAGE')

            }

            // console.log(receipt.logs.filter(l => l.event == 'ContractAddress')[1].args.addr)
            // console.log(receipt.logs.filter(l => l.event == 'Length')[1].args.length)
            // console.log(receipt.logs.filter(l => l.event == 'Signature')[1].args.sig)
            //
            //
            // console.log(receipt.logs.filter(l => l.event == 'ContractAddress')[2].args.addr)
            // console.log(receipt.logs.filter(l => l.event == 'Length')[2].args.length)
            // console.log(receipt.logs.filter(l => l.event == 'Signature')[2].args.sig)


            // const sign1 = receipt.logs.filter(l => l.event == 'Signature')[0].args.sig
            // console.log('singature')
            // console.log(sign1)
            // 0x00000001  960338c1b17f924e4b066aab766485c9eb680677 00000024       55241077 /        0000000000000000000000000000000000000000000000000000000000000044
            //    spec   |  address of contract                    / length / function selector / data

            // console.log(script_2)
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
