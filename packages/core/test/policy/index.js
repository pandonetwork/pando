const fs      = require('fs-extra')
const radspec = require('radspec')

var marked = require('marked');
var TerminalRenderer = require('marked-terminal');

marked.setOptions({
  // Define custom renderer
  renderer: new TerminalRenderer({
    showSectionPrefix: false
  })
});

const Branch       = artifacts.require('Branch')
const BranchKit    = artifacts.require('BranchKit')
const Dictatorship = artifacts.require('Dictatorship')

const { assertRevert }   = require('@aragon/test-helpers/assertThrow')
const getBlockNumber     = require('@aragon/test-helpers/blockNumber')(web3)
const { NULL_ADDR }      = require('../helpers/address')
const { deploySpecimen } = require('../helpers/specimen')
const {
    RFC_STATUS,
    RFC_STATE,
    RFC_SORTING,
    submittedRFCId,
    sortedRFCCommitId }  = require('../helpers/rfc')

contract('Pando ❤ Radspec', accounts => {
    let token, dao, specimen, kit, master

    const root         = accounts[0]
    const origin       = accounts[1]
    const dictator_1   = accounts[2]
    const dictator_2   = accounts[3]
    const unauthorized = accounts[4]
    const parents      = web3.eth.abi.encodeParameters(['address'], [NULL_ADDR])
    const parameters   = web3.eth.abi.encodeParameters(['address[]'], [[dictator_1, dictator_2]])

    const deploy = async () => {
        ;({ token, dao, specimen } = await deploySpecimen(root))

        const receipt_1 = await dao.newAppInstance('0x0003', (await Dictatorship.new()).address, { from: root })
        const kit       = await Dictatorship.at(receipt_1.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

        const receipt_2 = await specimen.createBranch('master', kit.address, parameters, { from: root })
        const master    = await Branch.at(receipt_2.logs.filter(l => l.event == 'CreateBranch')[0].args.proxy)

        return { token, dao, specimen, kit, master }
    }

    beforeEach(async () => {
        ;({ token, dao, specimen, kit, master } = await deploy())
    })

    it('should print human-readable policy correctly', async () => {
        let types    = []
        let bindings = {}
        const bytes  = await kit.getParameters()

        console.log('\t> Loading manifest.json')
        const manifest = fs.readJsonSync('./test/policy/manifest.json')

        console.log('\t> Extracting kit parameters')
        for (let param of manifest.parameters) {
            console.log('\t\t' + param.type + ':' + param.name + ' ' + param.description)
            types.push(param.type)
            bindings[param.name] = { type: param.type }
        }

        console.log('\t> Fetching parameters from contract')
        const params = web3.eth.abi.decodeParameters(types, bytes)
        manifest.parameters.forEach((param, index) => {
            bindings[param.name].value = params[index]
        })

        console.log('\t> Rendering human-readable policy\n\n')
        let result = await radspec.evaluateRaw(manifest.policy, bindings)
        result = '# Policy for branch ' + master.address + ' at block ' + await getBlockNumber() + '\n' + result
        console.log(marked(result))
    })
})
