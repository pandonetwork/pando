const sha3 = require('solidity-sha3').default

const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const getBlockNumber = require('@aragon/test-helpers/blockNumber')(web3)
const timeTravel = require('@aragon/test-helpers/timeTravel')(web3)
const {
  encodeCallScript,
  EMPTY_SCRIPT
} = require('@aragon/test-helpers/evmScript')
const ExecutionTarget = artifacts.require('ExecutionTarget')

const Voting = artifacts.require('ShareVoting')
const MiniMeToken = artifacts.require(
  '@aragon/os/contracts/lib/minime/MiniMeToken'
)
const DAOFactory = artifacts.require('@aragon/os/contracts/factory/DAOFactory')
const EVMScriptRegistryFactory = artifacts.require(
  '@aragon/os/contracts/factory/EVMScriptRegistryFactory'
)
const ACL = artifacts.require('@aragon/os/contracts/acl/ACL')
const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel')

const getContract = name => artifacts.require(name)
const pct16 = x =>
  new web3.BigNumber(x).times(new web3.BigNumber(10).toPower(16))
const createdVoteId = receipt =>
  receipt.logs.filter(x => x.event == 'StartVote')[0].args.voteId

const ANY_ADDR = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDRESS = '0x00'

const VOTER_STATE = ['ABSENT', 'YEA', 'NAY'].reduce((state, key, index) => {
  state[key] = index
  return state
}, {})

contract('Voting App', accounts => {
  let daoFact,
    app,
    token,
    executionTarget = {}

  const votingTime = 1000
  const root = accounts[0]

  before(async () => {
    const kernelBase = await getContract('Kernel').new()
    const aclBase = await getContract('ACL').new()
    const regFact = await EVMScriptRegistryFactory.new()
    daoFact = await DAOFactory.new(
      kernelBase.address,
      aclBase.address,
      regFact.address
    )
  })

  beforeEach(async () => {
    const r = await daoFact.newDAO(root)
    const dao = Kernel.at(
      r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao
    )
    const acl = ACL.at(await dao.acl())

    await acl.createPermission(
      root,
      dao.address,
      await dao.APP_MANAGER_ROLE(),
      root,
      { from: root }
    )

    const receipt = await dao.newAppInstance(
      '0x1234',
      (await Voting.new()).address,
      { from: root }
    )
    app = Voting.at(
      receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy
    )

    await acl.createPermission(
      ANY_ADDR,
      app.address,
      await app.CREATE_VOTES_ROLE(),
      root,
      { from: root }
    )
    await acl.createPermission(
      ANY_ADDR,
      app.address,
      await app.MODIFY_PARTICIPATION_ROLE(),
      root,
      { from: root }
    )
  })

  context('normal token supply', () => {
    const holder19 = accounts[0]
    const holder31 = accounts[1]
    const holder50 = accounts[2]
    const nonHolder = accounts[4]

    const minimumParticipationPct = pct16(20)

    beforeEach(async () => {
      token = await MiniMeToken.new(NULL_ADDRESS, NULL_ADDRESS, 0, 'n', 0, 'n', true) // empty parameters minime

      await token.generateTokens(holder19, 19)
      await token.generateTokens(holder31, 31)
      await token.generateTokens(holder50, 50)

      await app.initialize(token.address, minimumParticipationPct, votingTime)

      executionTarget = await ExecutionTarget.new()
    })

    it('fails on reinitialization', async () => {
      return assertRevert(async () => {
        await app.initialize(token.address, minimumParticipationPct, votingTime)
      })
    })

    it('deciding voting is automatically executed', async () => {
      const action = { to: executionTarget.address, calldata: executionTarget.contract.setValue.getData(0) }
      const script = encodeCallScript([action])
      const voteId = createdVoteId(await app.newVote(script, '', { from: holder50 }))
      await app.vote(voteId, 25, true, { from: holder50 })
      assert.equal(await executionTarget.value(), 25, 'should have received execution call')
    })

    it('execution script can be empty', async () => {
      const voteId = createdVoteId(await app.newVote(encodeCallScript([]), '', { from: holder50 }))
    })

    it('execution throws if any action on script throws', async () => {
      const action = { to: executionTarget.address, calldata: executionTarget.contract.autoThrow.getData(0) }
      const script = encodeCallScript([action])
      const voteId = createdVoteId(await app.newVote(script, '', { from: holder50 }))
      return assertRevert(async () => {
        await app.vote(voteId, 25, true, { from: holder50 })
      })
    })

    it('forwarding creates vote', async () => {
      const action = { to: executionTarget.address, calldata: executionTarget.contract.setValue.getData(0) }
      const script = encodeCallScript([action])
      const voteId = createdVoteId(await app.forward(script, { from: holder50 }))
      assert.equal(voteId, 1, 'voting should have been created')
    })

    it('can change minimum acceptance quorum', async () => {
      const receipt = await app.changeMinParticipationPct(1)
      const events = receipt.logs.filter(x => x.event == 'ChangeMinParticipation')

      assert.equal(events.length, 1, 'should have emitted ChangeMinParticipation event')
      assert.equal(await app.minParticipationPct(), 1, 'should have change acceptance quorum')
    })

    context('creating vote', () => {
      let voteId = {}
      let script = ''

      beforeEach(async () => {
        const action = { to: executionTarget.address, calldata: executionTarget.contract.setValue.getData(0) }
        script = encodeCallScript([action])
        voteId = createdVoteId(await app.newVote(script, 'metadata', { from: holder50 }))
      })

      it('has correct state', async () => {
        const [isOpen, isExecuted, creator, startDate, snapshotBlock, minParticipation, totalValue, totalWeight, totalVoters, execScript] = await app.getVote(voteId)

        assert.isTrue(isOpen, 'vote should be open')
        assert.isFalse(isExecuted, 'vote should not be executed')
        assert.equal(creator, holder50, 'creator should be correct')
        assert.equal(snapshotBlock, await getBlockNumber() - 1, 'snapshot block should be correct')
        assert.deepEqual(minParticipation, minimumParticipationPct, 'min participation should be app min participation')
        assert.equal(totalValue, 0, 'initial value should be 0')
        assert.equal(totalWeight, 0, 'initial weight should be 0')
        assert.equal(totalVoters, 100, 'total voters should be 100')
        assert.equal(execScript, script, 'script should be correct')
        assert.equal(await app.getVoteMetadata(voteId), 'metadata', 'should have returned correct metadata')
        assert.equal(await app.getVoterState(voteId, nonHolder), 0, 'nonHolder should not have voted')
      })

      it('changing min participation doesnt affect vote min participation', async () => {
        await app.changeMinParticipationPct(pct16(50))

        // With previous min acceptance quorum at 20%, vote should be approved
        // with new quorum at 50% it shouldn't have, but since min quorum is snapshotted
        // it will succeed

        await app.vote(voteId, 25, false, { from: holder31 })
        await timeTravel(votingTime + 1)

        const state = await app.getVote(voteId)
        assert.deepEqual(state[5], minimumParticipationPct, 'participation percentage in vote should stay equal')
        await app.executeVote(voteId) // exec doesn't fail
      })

      it('holder can vote', async () => {
        await app.vote(voteId, 18, true, { from: holder31 })
        const state = await app.getVote(voteId)
        const voterState = await app.getVoterState(voteId, holder31)

        assert.equal(state[6], 18 * 31, 'vote should have been counted')
        assert.equal(state[7], 31, 'vote should have been counted')
        assert.equal(voterState, 18, 'holder31 vote should have value 18')
      })

      it('holder can modify vote', async () => {
        await app.vote(voteId, 18, false, { from: holder31 })
        await app.vote(voteId, 27, true, { from: holder31 })
        const state = await app.getVote(voteId)
        const voterState = await app.getVoterState(voteId, holder31)

        assert.equal(state[6], 27 * 31, 'last vote should have been counted')
        assert.equal(state[7], 31, 'first vote should have been removed')
        assert.equal(voterState, 27, 'holder31 vote should have value 27')

      })

      it('token transfers dont affect voting', async () => {
        await token.transfer(nonHolder, 31, { from: holder31 })

        await app.vote(voteId, 50, true, { from: holder31 })
        const state = await app.getVote(voteId)

        assert.equal(state[7], 31, 'former holder vote should have been counted')
        assert.equal(await token.balanceOf(holder31), 0, 'balance should be 0 at current block')
      })

      it('throws when non-holder votes', async () => {
        return assertRevert(async () => {
          await app.vote(voteId, 50, true, { from: nonHolder })
        })
      })

      it('throws when voting after voting closes', async () => {
         await timeTravel(votingTime + 1)
         return assertRevert(async () => {
             await app.vote(voteId, 20, true, { from: holder31 })
         })
       })

       it('can execute vote if minimum participation is met', async () => {
         await app.vote(voteId, 15, false, { from: holder31 })
         await app.vote(voteId, 15, false, { from: holder19 })
         await timeTravel(votingTime + 1)
         await app.executeVote(voteId)
         assert.equal(await executionTarget.value(), 15, 'should have executed result')
       })

       it('cannot execute vote if minimum participation is not met', async () => {
         await app.vote(voteId, 15, true, { from: holder19 })
         await timeTravel(votingTime + 1)
         return assertRevert(async () => {
           await app.executeVote(voteId)
         })
       })

       it('vote can be executed automatically if decided', async () => {
         await app.vote(voteId, 27, true, { from: holder50 }) // causes execution
         assert.equal(await executionTarget.value(), 27, 'should have executed result')
       })

       it('vote can be not executed automatically if decided', async () => {
         await app.vote(voteId, 38, false, { from: holder50 }) // doesnt cause execution
         await app.executeVote(voteId)
         assert.equal(await executionTarget.value(), 38, 'should have executed result')
       })

       it('cannot re-execute vote', async () => {
         await app.vote(voteId, 0, true, { from: holder50 }) // causes execution
         return assertRevert(async () => {
           await app.executeVote(voteId)
         })
       })

       it('cannot vote on executed vote', async () => {
         await app.vote(voteId, 0, true, { from: holder50 }) // causes execution
         return assertRevert(async () => {
           await app.vote(voteId, 25, true, { from: holder19 })
         })
       })
    })
  })

  context('isValuePct unit test', async () => {
    let votingMock

    before(async () => {
      votingMock = await getContract('VotingMock').new()
    })

    it('tests total = 0', async () => {
      const result1 = await votingMock.isValuePct(0, 0, pct16(50))
      assert.equal(result1, false, 'total 0 should always return false')
      const result2 = await votingMock.isValuePct(1, 0, pct16(50))
      assert.equal(result2, false, 'total 0 should always return false')
    })

    it('tests value = 0', async () => {
      const result1 = await votingMock.isValuePct(0, 10, pct16(50))
      assert.equal(result1, false, 'value 0 should false if pct is non-zero')
      const result2 = await votingMock.isValuePct(0, 10, 0)
      assert.equal(result2, true, 'value 0 should return true if pct is zero')
    })
  })
})
