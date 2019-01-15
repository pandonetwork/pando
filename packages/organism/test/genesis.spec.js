/* eslint-disable no-undef */
const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL = artifacts.require('@aragon/os/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const Pando = artifacts.require('@pando/core/contracts/lib/Pando')
const Genesis = artifacts.require('Genesis')

const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const blocknumber = require('@aragon/test-helpers/blockNumber')(web3)

contract('Genesis', accounts => {
  let factory, pando, genesis

  const root = accounts[0]
  const authorized = accounts[1]
  const unauthorized = accounts[2]

  const individuation = { metadata: 'QwAwesomeIPFSHash' }

  const deploy = async () => {
    // DAO
    const receipt1 = await factory.newDAO(root)
    const dao = await Kernel.at(receipt1.logs.filter(l => l.event === 'DeployDAO')[0].args.dao)
    const acl = await ACL.at(await dao.acl())
    await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })

    const pando = await Pando.new()

    // Genesis
    const receipt2 = await dao.methods['newAppInstance(bytes32,address)']('0x0001', (await Genesis.new()).address, { from: root })
    const genesis = await Genesis.at(receipt2.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy)
    await acl.createPermission(authorized, genesis.address, await genesis.INDIVIDUATE_ROLE(), root, { from: root })
    await genesis.initialize(pando.address, { from: root })

    return { pando, genesis }
  }

  before(async () => {
    const kernelBase = await Kernel.new(true)
    const aclBase = await ACL.new()
    const regFactory = await RegistryFactory.new()
    factory = await DAOFactory.new(kernelBase.address, aclBase.address, regFactory.address)
  })

  beforeEach(async () => {
    ;({ pando, genesis } = await deploy())
  })

  context('#initialize', () => {
    it('should revert on reinitialization', async () => {
      return assertRevert(async () => {
        await genesis.initialize(pando.address, { from: root })
      })
    })
  })

  context('#individuate', () => {
    context('sender has INDIVIDUATE_ROLE', () => {
      it('should map individuation', async () => {
        const receipt = await genesis.individuate(individuation, {
          from: authorized,
        })
        const hash = receipt.logs.filter(x => x.event === 'Individuate')[0].args.hash
        const mapped = await genesis.getIndividuation(hash)

        assert.equal(mapped.blockstamp, await blocknumber())
        assert.equal(mapped.metadata, individuation.metadata)
      })

      it('should update head', async () => {
        const receipt = await genesis.individuate(individuation, {
          from: authorized,
        })
        const hash = receipt.logs.filter(x => x.event === 'Individuate')[0].args.hash
        const head = await genesis.head()

        assert.equal(head, hash)
      })
    })

    context('sender does not have INDIVIDUATE_ROLE', () => {
      it('should revert', async () => {
        return assertRevert(async () => {
          await genesis.individuate(individuation, { from: unauthorized })
        })
      })
    })
  })
})
