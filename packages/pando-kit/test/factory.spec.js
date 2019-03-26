/* eslint-disable no-undef */
const Kernel = artifacts.require('Kernel')
const ACL = artifacts.require('ACL')
const EVMScriptRegistry = artifacts.require('EVMScriptRegistry')
const Vault = artifacts.require('Vault')
const Finance = artifacts.require('Finance')
const TokenManager = artifacts.require('TokenManager')
const Voting = artifacts.require('Voting')
const PandoColony = artifacts.require('PandoColony.sol')
const PandoKit = artifacts.require('PandoKit')

const namehash = require('eth-ens-namehash').hash
const arapp = require('../arapp.json')

const ANY_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'
const NULL_ADDRESS = '0x00'
const ENS_ADDRESS = arapp.environments.default.registry

contract('PandoKit', accounts => {
  context('> #newInstance', () => {
    let kit
    let receipt

    beforeEach(async () => {
      kit = await PandoKit.new(ENS_ADDRESS)
      receipt = await kit.newInstance()
    })

    it('it should deploy DAO', async () => {
      const address = receipt.logs.filter(l => l.event === 'DeployInstance')[0].args.dao

      assert.notEqual(address, NULL_ADDRESS)
    })

    it('it should install apps', async () => {
      const apps = receipt.logs
        .filter(l => l.event === 'InstalledApp')
        .map(event => {
          return { id: event.args.appId, proxy: event.args.appProxy }
        })

      assert.equal(apps.length, 5)
      assert.equal(apps[0].id, namehash('vault.aragonpm.eth'))
      assert.equal(apps[1].id, namehash('finance.aragonpm.eth'))
      assert.equal(apps[2].id, namehash('token-manager.aragonpm.eth'))
      assert.equal(apps[3].id, namehash('voting.aragonpm.eth'))
      assert.equal(apps[4].id, namehash('pando-colony.aragonpm.eth'))
    })

    it('it should initialize apps ', async () => {
      const apps = receipt.logs
        .filter(l => l.event === 'InstalledApp')
        .map(event => {
          return { id: event.args.appId, proxy: event.args.appProxy }
        })

      const vault = await Vault.at(apps[0].proxy)
      const finance = await Finance.at(apps[1].proxy)
      const tokenManager = await TokenManager.at(apps[2].proxy)
      const voting = await Voting.at(apps[3].proxy)
      const colony = await PandoColony.at(apps[4].proxy)

      assert.isTrue(await vault.hasInitialized())
      assert.isTrue(await finance.hasInitialized())
      assert.isTrue(await tokenManager.hasInitialized())
      assert.isTrue(await voting.hasInitialized())
      assert.isTrue(await colony.hasInitialized())
    })

    it('it should set permissions', async () => {
      const address = receipt.logs.filter(l => l.event === 'DeployInstance')[0].args.dao
      const apps = receipt.logs
        .filter(l => l.event === 'InstalledApp')
        .map(event => {
          return { id: event.args.appId, proxy: event.args.appProxy }
        })

      const kernel = await Kernel.at(address)
      const acl = await ACL.at(await kernel.acl())
      const registry = await EVMScriptRegistry.at(await acl.getEVMScriptRegistry())
      const vault = await Vault.at(apps[0].proxy)
      const finance = await Finance.at(apps[1].proxy)
      const tokenManager = await TokenManager.at(apps[2].proxy)
      const voting = await Voting.at(apps[3].proxy)
      const colony = await PandoColony.at(apps[4].proxy)

      assert.isTrue(await kernel.hasPermission(voting.address, kernel.address, await kernel.APP_MANAGER_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(colony.address, kernel.address, await kernel.APP_MANAGER_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, acl.address, await acl.CREATE_PERMISSIONS_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(colony.address, acl.address, await acl.CREATE_PERMISSIONS_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(finance.address, vault.address, await vault.TRANSFER_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, finance.address, await finance.CREATE_PAYMENTS_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, finance.address, await finance.EXECUTE_PAYMENTS_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, finance.address, await finance.MANAGE_PAYMENTS_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, tokenManager.address, await tokenManager.MINT_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, tokenManager.address, await tokenManager.ISSUE_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, tokenManager.address, await tokenManager.ASSIGN_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, tokenManager.address, await tokenManager.REVOKE_VESTINGS_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, tokenManager.address, await tokenManager.BURN_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(ANY_ADDRESS, voting.address, await voting.CREATE_VOTES_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, voting.address, await voting.MODIFY_QUORUM_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, voting.address, await voting.MODIFY_SUPPORT_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(ANY_ADDRESS, colony.address, await colony.CREATE_REPOSITORY_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, registry.address, await registry.REGISTRY_ADD_EXECUTOR_ROLE(), '0x0'))
      assert.isTrue(await kernel.hasPermission(voting.address, registry.address, await registry.REGISTRY_MANAGER_ROLE(), '0x0'))

      assert.equal(await acl.getPermissionManager(kernel.address, await kernel.APP_MANAGER_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(acl.address, await acl.CREATE_PERMISSIONS_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(vault.address, await vault.TRANSFER_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(finance.address, await finance.CREATE_PAYMENTS_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(finance.address, await finance.EXECUTE_PAYMENTS_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(finance.address, await finance.MANAGE_PAYMENTS_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(tokenManager.address, await tokenManager.MINT_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(tokenManager.address, await tokenManager.ISSUE_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(tokenManager.address, await tokenManager.ASSIGN_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(tokenManager.address, await tokenManager.REVOKE_VESTINGS_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(tokenManager.address, await tokenManager.BURN_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(voting.address, await voting.CREATE_VOTES_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(voting.address, await voting.MODIFY_QUORUM_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(voting.address, await voting.MODIFY_SUPPORT_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(colony.address, await colony.CREATE_REPOSITORY_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(registry.address, await registry.REGISTRY_ADD_EXECUTOR_ROLE()), voting.address)
      assert.equal(await acl.getPermissionManager(registry.address, await registry.REGISTRY_MANAGER_ROLE()), voting.address)
    })
  })
})
