/* eslint-disable no-undef */
const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL = artifacts.require('@aragon/core/contracts/acl/ACL')
const Vault = artifacts.require('@aragon/apps-vault/contracts/Vault')
const Finance = artifacts.require('@aragon/apps-finance/contracts/Finance')
const TokenManager = artifacts.require(
  '@aragon/apps-token-manager/contracts/TokenManager'
)
const Voting = artifacts.require('@aragon/apps-voting/contracts/Voting')
const Scheme = artifacts.require(
  '@pando/scheme-democracy/contracts/DemocracyScheme'
)
const Colony = artifacts.require('@pando/core/contracts/colony/IColony')
const OrganizationFactory = artifacts.require('OrganizationFactory')

const namehash = require('eth-ens-namehash').hash
const { ADDR_NULL, ADDR_ANY } = require('@pando/helpers/address')
const chai = require('chai')
/* eslint-disable no-unused-vars */
const should = chai.should()
/* eslint-enable no-unused-vars */

const arapp = require('../arapp.json')
const ENS_ADDRESS = arapp.environments.default.registry

contract('OrganizationFactory', accounts => {
  let factory
  let address
  let apps
  let kernel
  let acl
  let vault
  let finance
  let tokenManager
  let voting
  let scheme
  let colony

  before(async () => {
    factory = await OrganizationFactory.new(ENS_ADDRESS)
  })

  context('#newInstance', () => {
    it('it should deploy DAO', async () => {
      const receipt = await factory.newInstance()

      address = receipt.logs.filter(l => l.event === 'DeployInstance')[0].args
        .dao
      apps = receipt.logs
        .filter(l => l.event === 'InstalledApp')
        .map(event => {
          return { id: event.args.appId, proxy: event.args.appProxy }
        })

      address.should.not.equal(ADDR_NULL)
    })

    it('it should install apps', async () => {
      apps[0].id.should.equal(namehash('vault.aragonpm.eth'))
      apps[1].id.should.equal(namehash('finance.aragonpm.eth'))
      apps[2].id.should.equal(namehash('token-manager.aragonpm.eth'))
      apps[3].id.should.equal(namehash('voting.aragonpm.eth'))
      apps[4].id.should.equal(namehash('scheme-democracy.aragonpm.eth'))
      apps[5].id.should.equal(namehash('colony.aragonpm.eth'))

      kernel = await Kernel.at(address)
      acl = await ACL.at(await kernel.acl())
      vault = await Vault.at(apps[0].proxy)
      finance = await Finance.at(apps[1].proxy)
      tokenManager = await TokenManager.at(apps[2].proxy)
      voting = await Voting.at(apps[3].proxy)
      scheme = await Scheme.at(apps[4].proxy)
      colony = await Colony.at(apps[5].proxy)
    })

    it('it should initialize apps', async () => {
      ;(await Promise.all([
        vault.hasInitialized(),
        finance.hasInitialized(),
        tokenManager.hasInitialized(),
        voting.hasInitialized(),
        scheme.hasInitialized(),
      ])).should.deep.equal([true, true, true, true, true])
    })

    it('it should set permissions', async () => {
      ;(await Promise.all([
        kernel.hasPermission(
          colony.address,
          kernel.address,
          await kernel.APP_MANAGER_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          colony.address,
          acl.address,
          await acl.CREATE_PERMISSIONS_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          finance.address,
          vault.address,
          await vault.TRANSFER_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          voting.address,
          finance.address,
          await finance.CREATE_PAYMENTS_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          voting.address,
          finance.address,
          await finance.EXECUTE_PAYMENTS_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          voting.address,
          finance.address,
          await finance.MANAGE_PAYMENTS_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          colony.address,
          tokenManager.address,
          await tokenManager.MINT_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          voting.address,
          tokenManager.address,
          await tokenManager.ISSUE_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          voting.address,
          tokenManager.address,
          await tokenManager.ASSIGN_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          voting.address,
          tokenManager.address,
          await tokenManager.REVOKE_VESTINGS_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          voting.address,
          tokenManager.address,
          await tokenManager.BURN_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          ADDR_ANY,
          voting.address,
          await voting.CREATE_VOTES_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          voting.address,
          scheme.address,
          await scheme.UPDATE_PARAMETERS_ROLE(),
          '0x0'
        ),
        kernel.hasPermission(
          ADDR_ANY,
          colony.address,
          await colony.DEPLOY_ORGANISM_ROLE(),
          '0x0'
        ),
      ])).should.deep.equal([
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ])
    })
  })
})
