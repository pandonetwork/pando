const Kernel          = artifacts.require('@aragon/os/contracts/kernel/Kernel.sol')
const ACL             = artifacts.require('@aragon/core/contracts/acl/ACL')
const RegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const DAOFactory      = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
// const MiniMeToken     = artifacts.require('@aragon/core/contracts/lib/minime/MiniMeToken')
// const Colony          = artifacts.require('@pando/colony/contracts/Colony')
// const Organism        = artifacts.require('@pando/organism/contracts/core/Organism')
// const Lineage         = artifacts.require('@pando/organism/contracts/core/Lineage')
// const Genesis         = artifacts.require('@pando/organism/contracts/core/Genesis')

const OrganizationFactory = artifacts.require('OrganizationFactory')

const ENS = artifacts.require('@aragon/os/contracts/lib/ens/ENS')
const Resolver = artifacts.require('@aragon/os/contracts/lib/ens/PublicResolver.sol')
const Repo = artifacts.require('@aragon/os/contracts/apm/Repo.sol')

const { ADDR_NULL }    = require('@pando/helpers/address')
const { HASH_NULL }    = require('@pando/helpers/hash')

const { assertRevert } = require('@aragon/test-helpers/assertThrow')

const chai = require('chai')

chai.should()

const namehash = require('eth-ens-namehash').hash

// const Finance = artifacts.require('Finance')
// const TokenManager = artifacts.require('TokenManager')
// const Vault = artifacts.require('Vault')
// const Voting = artifacts.require('Voting')
//
// const apps = ['finance', 'token-manager', 'vault', 'voting']
// const appIds = apps.map(app => namehash(require(`@aragon/apps-${app}/arapp`).environments.default.appName))
//
// const getContract = name => artifacts.require(name)

const getEventResult = (receipt, event, param) => receipt.logs.filter(l => l.event == event)[0].args[param]
const createdVoteId = receipt => getEventResult(receipt, 'StartVote', 'voteId')
const getAppProxy = (receipt, id) => receipt.logs.filter(l => l.event == 'InstalledApp' && l.args.appId == id)[0].args.appProxy


const arapp = require('../arapp.json')

console.log(arapp)

const ENS_ADDRESS = arapp.environments.default.registry
const ENS_NAME    = arapp.environments.default.appName



const initialize = async (networkName) => {
    const ens      = await ENS.at(ENS_ADDRESS)
    const resolver = await Resolver.at(await ens.resolver(namehash('aragonpm.eth')))
    const repo     = await Repo.at((await resolver.addr(namehash(ENS_NAME))))
    const factory  = await OrganizationFactory.at((await repo.getLatest())[1])

    return factory
}

contract('Democracy Kit', accounts => {
    let factory

    const root         = accounts[0]

    before(async () => {
        // create Democracy Kit

        factory = await OrganizationFactory.new('0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1')

        // const networkName = (await getNetwork(networks)).name
        // if (networkName == 'devnet' || networkName == 'rpc') {
        //     // transfer some ETH to other accounts
        //     await web3.eth.sendTransaction({ from: owner, to: holder20, value: web3.toWei(1, 'ether') })
        //     await web3.eth.sendTransaction({ from: owner, to: holder29, value: web3.toWei(1, 'ether') })
        //     await web3.eth.sendTransaction({ from: owner, to: holder51, value: web3.toWei(1, 'ether') })
        //     await web3.eth.sendTransaction({ from: owner, to: nonHolder, value: web3.toWei(1, 'ether') })
        // }
        // kit = await getKit(networkName)
        // const holders = [holder20, holder29, holder51]
        // const stakes = [20e18, 29e18, 51e18]
        //
        // // create Token
        // const receiptToken = await kit.newToken('DemocracyToken', 'DTT', { from: owner })
        // tokenAddress = getEventResult(receiptToken, 'DeployToken', 'token')
        //
        // // create Instance
        // receiptInstance = await kit.newInstance('DemocracyDao-' + Math.random() * 1000, holders, stakes, neededSupport, minimumAcceptanceQuorum, votingTime, { from: owner })
        // daoAddress = getEventResult(receiptInstance, 'DeployInstance', 'dao')
        //
        // // generated apps
        // financeAddress = getAppProxy(receiptInstance, appIds[0])
        // finance = await Finance.at(financeAddress)
        // tokenManagerAddress = getAppProxy(receiptInstance, appIds[1])
        // tokenManager = TokenManager.at(tokenManagerAddress)
        // vaultAddress = getAppProxy(receiptInstance, appIds[2])
        // vault = await Vault.at(vaultAddress)
        // votingAddress = getAppProxy(receiptInstance, appIds[3])
        // voting = Voting.at(votingAddress)
    })

    context('#deployOrganization', () => {

        it('fails creating a DAO if holders and stakes don\'t match', async() => {
            const receipt = await factory.newInstance()
            const address = receipt.logs.filter(l => l.event == 'DeployInstance')[0].args.dao

            console.log(address)

        })

    })

})
