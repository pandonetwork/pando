/* eslint-disable no-undef */
const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const MiniMeToken = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')
const TokenManager = artifacts.require('@aragon/apps-token-manager/contracts/TokenManager')
const Pando = artifacts.require('@pando/core/contracts/lib/Pando')
const Colony = artifacts.require('Colony')
const Lineage = artifacts.require('@pando/organism/contracts/Lineage')
const Genesis = artifacts.require('@pando/organism/contracts/Genesis')
const Organism = artifacts.require('@pando/organism/contracts/Organism')
const DemocracyScheme = artifacts.require('@pando/scheme-democracy/contracts/DemocracyScheme')
/* eslint-disable no-undef */
const { ADDR_NULL } = require('@pando/helpers/address')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')

const chai = require('chai')
chai.should()

contract('Colony', accounts => {
	let factory, acl, tokenManager, scheme, colony

	const root = accounts[0]
	const unauthorized = accounts[1]

	const parameters = { quorum: 50, required: 20 }

	const deploy = async () => {
		// DAO
		const receipt1 = await factory.newDAO(root)
		const dao = await Kernel.at(receipt1.logs.filter(l => l.event === 'DeployDAO')[0].args.dao)
		const acl = await ACL.at(await dao.acl())
		await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })
		// MiniMeToken
		const token = await MiniMeToken.new(ADDR_NULL, ADDR_NULL, 0, 'Native Governance Token', 0, 'NGT', true)
		// TokenManager
		const receipt2 = await dao.methods['newAppInstance(bytes32,address)']('0x0001', (await TokenManager.new()).address)
		const tokenManager = await TokenManager.at(receipt2.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy)
		// Colony
		const receipt3 = await dao.methods['newAppInstance(bytes32,address)']('0x0002', (await Colony.new()).address)
		const colony = await Colony.at(receipt3.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy)
		// ACL
		const receipt4 = await dao.methods['newAppInstance(bytes32,address)']('0x0003', (await DemocracyScheme.new()).address, { from: root })
		const scheme = await DemocracyScheme.at(receipt4.logs.filter(l => l.event === 'NewAppProxy')[0].args.proxy)
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

		return { acl, tokenManager, scheme, colony }
	}

	before(async () => {
		const kernelBase = await Kernel.new(true) // petrify immediately
		const aclBase = await ACL.new()
		const regFactory = await RegistryFactory.new()
		factory = await DAOFactory.new(kernelBase.address, aclBase.address, regFactory.address)
	})

	context('#initialize', () => {
		before(async () => {
			({ acl, tokenManager, scheme, colony } = await deploy())
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

	context('#deploy', () => {
		let pando, lineage, genesis, organism

		before(async () => {
			({ acl, tokenManager, scheme, colony } = await deploy())
		})

		context('sender has DEPLOY_ORGANISM_ROLE', () => {
			it('it should deploy organism', async () => {
				const receipt = await colony.deploy()
				const address = receipt.logs.filter(l => l.event === 'DeployOrganism')[0].args.organism

				organism = await Organism.at(address)

				address.should.not.equal(ADDR_NULL)
			})

			it('it should initialize organism', async () => {
				pando = await Pando.at(await organism.pando())
				lineage = await Lineage.at(await organism.lineage())
				genesis = await Genesis.at(await organism.genesis())

				pando.should.not.equal(ADDR_NULL)
				lineage.should.not.equal(ADDR_NULL)
				genesis.should.not.equal(ADDR_NULL)
			})

			it('lineage contract should revert on reinitialization', async () => {
				return assertRevert(async () => {
					await lineage.initialize({ from: root })
				})
			})

			it('genesis contract should revert on reinitialization', async () => {
				return assertRevert(async () => {
					await genesis.initialize(pando.address, { from: root })
				})
			})

			it('organism contract should revert on reinitialization', async () => {
				return assertRevert(async () => {
					await organism.initialize(pando.address, genesis.address, lineage.address, { from: root })
				})
			})

			it('it should set permissions', async () => {
				(await Promise.all([
					acl.hasPermission(organism.address, lineage.address, await lineage.MINT_ROLE()),
					acl.hasPermission(organism.address, genesis.address, await genesis.INDIVIDUATE_ROLE()),
					acl.hasPermission(scheme.address, organism.address, await organism.CREATE_RFI_ROLE()),
					acl.hasPermission(scheme.address, organism.address, await organism.MERGE_RFI_ROLE()),
					acl.hasPermission(scheme.address, organism.address, await organism.REJECT_RFI_ROLE()),
					acl.hasPermission(scheme.address, organism.address, await organism.ACCEPT_RFL_ROLE()),
					acl.hasPermission(scheme.address, organism.address, await organism.REJECT_RFL_ROLE()),
				])).should.deep.equal([true, true, true, true, true, true, true])
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
	context('#getOrganisms', () => {
		let address1, address2

		before(async () => {
			({ acl, tokenManager, scheme, colony } = await deploy())
			const receipt1 = await colony.deploy()
			const receipt2 = await colony.deploy()

			address1 = receipt1.logs.filter(l => l.event === 'DeployOrganism')[0].args.organism
			address2 = receipt2.logs.filter(l => l.event === 'DeployOrganism')[0].args.organism
		})

		it('it should return deployed organisms addresses', async () => {
			const organisms = await colony.getOrganisms()

			organisms[0].should.equal(address1)
			organisms[1].should.equal(address2)
		})
	})
})
