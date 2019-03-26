/* eslint-disable no-undef */
const DAOFactory = artifacts.require('DAOFactory')
const Kernel = artifacts.require('Kernel')
const ACL = artifacts.require('ACL')
const EVMScriptRegistryFactory = artifacts.require('EVMScriptRegistryFactory')
const PandoColony = artifacts.require('PandoColony')
const PandoRepository = artifacts.require('PandoRepository')

const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const arapp = require('../arapp.json')

// const ANY_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDRESS = '0x00'
const ENS_ADDRESS = arapp.environments.default.registry

contract('PandoColony', accounts => {
  let factory, dao, acl, colony

  const root = accounts[0]
  const authorized = accounts[1]
  const unauthorized = accounts[2]

  const deploy = async () => {
    // DAO
    const receipt1 = await factory.newDAO(root)
    const dao = await Kernel.at(receipt1.logs.filter(l => l.event === 'DeployDAO')[0].args.dao)
    const acl = await ACL.at(await dao.acl())
    await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
    // Colony
    const receipt2 = await dao.methods['newAppInstance(bytes32,address)']('0x0001', (await PandoColony.new()).address)
    const colony = await PandoColony.at(receipt2.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy)
    // Initialization
    await colony.initialize(ENS_ADDRESS, true, { from: root })
    // Permissions
    await acl.grantPermission(colony.address, dao.address, await dao.APP_MANAGER_ROLE(), { from: root })
    await acl.grantPermission(colony.address, acl.address, await acl.CREATE_PERMISSIONS_ROLE(), { from: root })
    await acl.createPermission(authorized, colony.address, await colony.CREATE_REPOSITORY_ROLE(), root, { from: root })

    return { dao, acl, colony }
  }

  before(async () => {
    const kBase = await Kernel.new(true) // petrify immediately
    const aBase = await ACL.new()
    const rFactory = await EVMScriptRegistryFactory.new()
    factory = await DAOFactory.new(kBase.address, aBase.address, rFactory.address)
  })

  context('> #initialize', () => {
    before(async () => {
      ;({ dao, acl, colony } = await deploy())
    })

    it('it should initialize colony', async () => {
      assert.equal((await colony.ens()).toLowerCase(), ENS_ADDRESS)
    })

    it('it should revert on re-initialization', async () => {
      return assertRevert(async () => {
        await colony.initialize(ENS_ADDRESS, { from: root })
      })
    })
  })

  context('> #createRepository', () => {
    beforeEach(async () => {
      ;({ dao, acl, colony } = await deploy())
    })

    context('> sender has CREATE_REPOSITORY_ROLE', () => {
      it('it should deploy repository', async () => {
        const receipt = await colony.createRepository('aragonOS', 'Solidity framework to build crazy DAOs', { from: authorized })
        const address = receipt.logs.filter(l => l.event === 'CreateRepository')[0].args.repository

        assert.notEqual(address, NULL_ADDRESS)
        assert.equal(await colony.repositoriesLength(), 1)
        assert.equal(await colony.repositories(1), address)
      })

      it('it should initialize repository', async () => {
        const receipt = await colony.createRepository('aragonOS', 'Solidity framework to build crazy DAOs', { from: authorized })
        const address = receipt.logs.filter(l => l.event === 'CreateRepository')[0].args.repository
        const repo = await PandoRepository.at(address)

        assert.equal(await repo.name(), 'aragonOS')
        assert.equal(await repo.description(), 'Solidity framework to build crazy DAOs')
      })

      it('it should set permissions', async () => {
        const receipt = await colony.createRepository('aragonOS', 'Solidity framework to build crazy DAOs', { from: authorized })
        const address = receipt.logs.filter(l => l.event === 'CreateRepository')[0].args.repository
        const repo = await PandoRepository.at(address)

        assert.isTrue(await dao.hasPermission(authorized, repo.address, await repo.PUSH_ROLE(), '0x0'))
        assert.isTrue(await dao.hasPermission(authorized, repo.address, await repo.UPDATE_INFORMATIONS_ROLE(), '0x0'))

        assert.equal(await acl.getPermissionManager(repo.address, await repo.PUSH_ROLE()), authorized)
        assert.equal(await acl.getPermissionManager(repo.address, await repo.UPDATE_INFORMATIONS_ROLE()), authorized)
      })
    })

    context('> sender does not have CREATE_REPOSITORY_ROLE', () => {
      before(async () => {
        ;({ dao, acl, colony } = await deploy())
      })

      it('it should revert', async () => {
        return assertRevert(async () => {
          await colony.createRepository('aragonOS', 'Solidity framework to build crazy DAOs', { from: unauthorized })
        })
      })
    })
  })
})
