const DAOFactory   = artifacts.require('@aragon/os/contracts/factory/DAOFactory')
const EVMFactory   = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const ACL          = artifacts.require('@aragon/os/contracts/acl/ACL')
const Kernel       = artifacts.require('@aragon/os/contracts/kernel/Kernel')
const Token        = artifacts.require('@aragon/os/contracts/lib/minime/MiniMeToken')
const TokenManager = artifacts.require('@aragon/apps-token-manager/contracts/TokenManager')
const Specimen     = artifacts.require('Specimen')

const { ANY_ADDR, NULL_ADDR } = require('./address')

const deploySpecimen = async (root) => {
    // Factory
    const kernelBase = await Kernel.new()
    const aclBase    = await ACL.new()
    const regFact    = await EVMFactory.new()
    const factory    = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)
    // Token
    const token = await Token.new(NULL_ADDR, NULL_ADDR, 0, 'Native Governance Token', 0, 'NGT', false)
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
    const receipt_3 = await dao.newAppInstance('0x0002', (await Specimen.new()).address, { from: root })
    const specimen  = await Specimen.at(receipt_3.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)
    await acl.createPermission(root, specimen.address, await specimen.CREATE_BRANCH_ROLE(), root, { from: root })
    await acl.createPermission(root, specimen.address, await specimen.FREEZE_BRANCH_ROLE(), root, { from: root })
    await acl.createPermission(root, specimen.address, await specimen.ISSUE_REWARD_ROLE(), specimen.address, { from: root })
    await acl.grantPermission(specimen.address, dao.address, await dao.APP_MANAGER_ROLE(), { from: root })
    await acl.grantPermission(specimen.address, tokenManager.address, await tokenManager.MINT_ROLE(), { from: root })
    await specimen.initialize(tokenManager.address)

    return { token, dao, specimen }
}

module.exports = {
    deploySpecimen
}
