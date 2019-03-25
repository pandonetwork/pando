import APM from '@aragon/apm'
import defaultsDeep from 'lodash.defaultsdeep'
import ora from 'ora'
import Web3 from 'web3'
import yargs from 'yargs'
import die from '../../../lib/die'
import options from '../../../lib/options'
import Pando from '../../../lib/pando'

const builder = () => {
  return yargs
    .option('network', {
      describe: 'Network you want to deploy the DAO to',
      choices: ['devchain', 'rinkeby'],
      default: 'devchain',
      required: false,
    })
    .strict()
    .help()
    .version(false)
}

const handler = async argv => {
  try {
    let txHash, spinner

    const pando = await Pando.create(defaultsDeep(options(), { ethereum: { network: argv.network } }))
    const apm = APM(new Web3(pando.options.ethereum.provider), {
      ensRegistryAddress: pando.options.apm.ens,
      ipfs: 'http://locahost:5001',
    })
    const packageName = pando.options.ethereum.network === 'devchain' ? 'pando-kit.aragonpm.eth' : 'pando-kit.open.aragonpm.eth'
    const factory = await pando.artifacts.PandoKit.at(await apm.getLatestVersionContract(packageName))

    try {
      spinner = ora(`Deploying organization on ${pando.options.ethereum.network}`).start()

      factory
        .newInstance()
        .on('error', err => {
          if (!err.message.includes('Failed to subscribe to new newBlockHeaders to confirm the transaction receipts')) {
            spinner.fail(`Failed to deploy organization on ${pando.options.ethereum.network}: ` + err.message)
            die()
          }
        })
        .on('transactionHash', hash => {
          txHash = hash
          spinner.text = `Deploying organization on ${pando.options.ethereum.network} through tx ${txHash}`
        })
        .then(receipt => {
          const address = receipt.logs.filter(l => l.event === 'DeployInstance')[0].args.dao
          spinner.succeed(`Organization deployed on ${pando.options.ethereum.network} at address ${address} through tx ${txHash}`)
          process.exit(0)
        })
        .catch(err => {
          spinner.fail(`Failed to deploy organization on ${pando.options.ethereum.network}: ` + err.message)
          die()
        })
    } catch (err) {
      spinner.stop()
      die(err.message)
    }
  } catch (err) {
    die(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const deploy = {
  command: 'deploy',
  desc: 'Deploy a new pando organization',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
