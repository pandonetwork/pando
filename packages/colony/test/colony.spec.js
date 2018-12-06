const Kernel          = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL             = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory      = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const MiniMeToken     = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')
const TokenManager    = artifacts.require('@aragon/apps-token-manager/contracts/TokenManager')

const Pando           = artifacts.require('@pando/core/contracts/lib/Pando')
const DemocracyScheme = artifacts.require('@pando/scheme-democracy/contracts/DemocracyScheme')
const Colony          = artifacts.require('Colony')
const Lineage         = artifacts.require('@pando/organism/contracts/Lineage')
const Genesis         = artifacts.require('@pando/organism/contracts/Genesis')
const Organism        = artifacts.require('@pando/organism/contracts/Organism')

const { ADDR_NULL, ADDR_ANY } = require('@pando/helpers/address')
const { HASH_NULL }           = require('@pando/helpers/hash')
const { assertRevert }        = require('@aragon/test-helpers/assertThrow')

const chai = require('chai')
chai.should()

contract('Colony', accounts => {
    let factory, dao, acl, token, tokenManager, scheme, colony

    const root         = accounts[0]
    const unauthorized = accounts[1]

    const parameters = { quorum: 50, required: 20 }

    const deploy = async () => {
        // DAO
        const receipt_1 = await factory.newDAO(root)
        const dao       = await Kernel.at(receipt_1.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        const acl       = await ACL.at(await dao.acl())
        await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
        // MiniMeToken
        const token = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Governance Token', 0, 'NGT', true)
        // TokenManager
        const receipt_2 = await dao.methods['newAppInstance(bytes32,address)']('0x0001', (await TokenManager.new()).address)
        const tokenManager   = await TokenManager.at(receipt_2.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // Colony
        const receipt_3 = await dao.methods['newAppInstance(bytes32,address)']('0x0002', (await Colony.new()).address)
        const colony   = await Colony.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // ACL
        const receipt_4 = await dao.methods['newAppInstance(bytes32,address)']('0x0003', (await DemocracyScheme.new()).address, { from: root })
        const scheme    = await DemocracyScheme.at(receipt_4.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
        // Permissions
        await acl.createPermission(root, colony.address, await colony.DEPLOY_ORGANISM_ROLE(), root, { from: root })
        await acl.grantPermission(colony.address, dao.address, await dao.APP_MANAGER_ROLE(), { from: root })
        await acl.grantPermission(colony.address, acl.address, await acl.CREATE_PERMISSIONS_ROLE(), { from: root })
        await acl.createPermission(colony.address, tokenManager.address, await tokenManager.MINT_ROLE(), root, { from: root })
        await acl.createPermission(colony.address, tokenManager.address, await tokenManager.ISSUE_ROLE(), root, { from: root })
        await acl.createPermission(colony.address, tokenManager.address, await tokenManager.ASSIGN_ROLE(), root, { from: root })
        await acl.createPermission(colony.address, tokenManager.address, await tokenManager.REVOKE_VESTINGS_ROLE(), root, { from: root })
        await acl.createPermission(colony.address, tokenManager.address, await tokenManager.BURN_ROLE(), root, { from: root })
        // Initialization
        await token.changeController(tokenManager.address, { from: root })
        await tokenManager.initialize(token.address, true, 0, { from: root })
        await scheme.initialize(token.address, parameters.quorum, parameters.required, { from: root })
        await colony.initialize('0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1', tokenManager.address, scheme.address, { from: root })

        return { dao, acl, token, tokenManager, scheme, colony }
    }

    before(async () => {
        const kernel_base = await Kernel.new(true) // petrify immediately
        const acl_base    = await ACL.new()
        const reg_factory = await RegistryFactory.new()
        factory           = await DAOFactory.new(kernel_base.address, acl_base.address, reg_factory.address)
    })

    context('#initialize', () => {
      before(async () => {
        ;({ dao, acl, token, tokenManager, scheme, colony } = await deploy())
      })

      it('it should initialize colony', async () => {
        const _ens = await colony.ens()
        const _tokenManager = await colony.tokenManager()
        const _scheme = await colony.scheme()

        _ens.toLowerCase().should.equal('0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1')
        _tokenManager.should.equal(tokenManager.address)
        _scheme.should.equal(scheme.address)
      })

      it('it should revert on reinitialization', async () => {
        return assertRevert(async () => {
          await colony.initialize('0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1', tokenManager.address, scheme.address, { from: root })
        })
      })
    })

    context('#deployOrganism', () => {
      let pando, lineage, genesis, organism

      before(async () => {
        ;({ dao, acl, token, tokenManager, scheme, colony } = await deploy())
      })

      context('sender has DEPLOY_ORGANISM_ROLE', () => {
        it('it should deploy organism', async () => {
          const receipt = await colony.deploy()
          const address = receipt.logs.filter(l => l.event == 'DeployOrganism')[0].args.organism

          organism = await Organism.at(address)

          address.should.not.equal(ADDR_NULL)
        })

        it('it should initialize organism', async () => {
          pando    = await Pando.at(await organism.pando())
          lineage  = await Lineage.at(await organism.lineage())
          genesis  = await Genesis.at(await organism.genesis())

          pando.should.not.equal(ADDR_NULL)
          lineage.should.not.equal(ADDR_NULL)
          genesis.should.not.equal(ADDR_NULL)
        })

        it('it should revert on reinitialization', async () => {
          return assertRevert(async () => {
            await lineage.initialize({ from: root })
          })

          return assertRevert(async () => {
            await genesis.initialize(pando.address, { from: root })
          })

          return assertRevert(async () => {
            await organism.initialize(pando.address, genesis.address, lineage.address, { from: root })
          })
        })

        it('it should set permissions', async () => {
          let has_mint_role        = await acl.hasPermission(organism.address, lineage.address, await lineage.MINT_ROLE())
          let has_individuate_role = await acl.hasPermission(organism.address, genesis.address, await genesis.INDIVIDUATE_ROLE())
          let has_create_rfi_role  = await acl.hasPermission(scheme.address, organism.address, await organism.CREATE_RFI_ROLE())
          let has_merge_rfi_role   = await acl.hasPermission(scheme.address, organism.address, await organism.MERGE_RFI_ROLE())
          let has_reject_rfi_role  = await acl.hasPermission(scheme.address, organism.address, await organism.REJECT_RFI_ROLE())
          let has_accept_rfl_role  = await acl.hasPermission(scheme.address, organism.address, await organism.ACCEPT_RFL_ROLE())
          let has_reject_rfl_role  = await acl.hasPermission(scheme.address, organism.address, await organism.REJECT_RFL_ROLE())

          has_mint_role.should.be.true
          has_individuate_role.should.be.true
          has_create_rfi_role.should.be.true
          has_merge_rfi_role.should.be.true
          has_reject_rfi_role.should.be.true
          has_accept_rfl_role.should.be.true
          has_reject_rfl_role.should.be.true
        })
      })

      context('sender does not have DEPLOY_ORGANISM_ROLE', () => {
        it('it should revert', async () => {
          return assertRevert(async () => {
            await colony.deploy({ from: unauthorized })
          })
        })
      })
    })
})
