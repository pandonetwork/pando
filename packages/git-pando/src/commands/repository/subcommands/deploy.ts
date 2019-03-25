import Aragon from '@aragon/wrapper'
import namehash from 'eth-ens-namehash'
import defaultsDeep from 'lodash.defaultsdeep'
import ora from 'ora'
import yargs from 'yargs'
import die from '../../../lib/die'
import options from '../../../lib/options'
import Pando from '../../../lib/pando'

const _apps = async (wrapper: Aragon): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    wrapper.apps.subscribe(resolve, reject)
  })
}

const builder = () => {
  return yargs
    .option('name', {
      alias: 'n',
      description: 'Name of the repository',
      required: true,
    })
    .option('description', {
      alias: 'd',
      description: 'Description of the repository',
      required: false,
    })
    .option('organization', {
      alias: 'dao',
      description: 'Pando organization to deploy the repository in',
      required: true,
    })
    .option('network', {
      choices: ['devchain', 'rinkeby'],
      default: 'devchain',
      describe: 'Network you want to deploy the repository to',
      required: false,
    })
    .strict()
    .help()
    .version(false)
}

const handler = async argv => {
  try {
    let txHash
    let spinner

    const pando = await Pando.create(defaultsDeep(options(), { ethereum: { network: argv.network } }))
    const appId = pando.options.ethereum.network === 'devchain' ? namehash.hash('pando-colony.aragonpm.eth') : namehash.hash('pando-colony.open.aragonpm.eth')
    const wrapper = new Aragon(argv.organization, {
      apm: {
        ensRegistryAddress: pando.options.apm.ens,
        ipfs: pando.options.ipfs.gateway,
      },
      defaultGasPriceFn: () => String(5e9), // gwei
      provider: pando.options.ethereum.provider,
    })
    await wrapper.init({ accounts: { providedAccounts: [pando.options.ethereum.account] } })
    const apps = await _apps(wrapper)
    const colonyAddress = apps.filter(app => app.appId === appId)[0].proxyAddress
    const colony = await pando.artifacts.PandoColony.at(colonyAddress)

    try {
      spinner = ora(`Deploying repository '${argv.name}' on ${pando.options.ethereum.network}`).start()

      colony
        .createRepository(argv.name, argv.description || '')
        .on('error', err => {
          if (!err.message.includes('Failed to subscribe to new newBlockHeaders to confirm the transaction receipts')) {
            spinner.fail(`Failed to deploy repository '${argv.name}' on ${pando.options.ethereum.network}: ` + err.message)
            die()
          }
        })
        .on('transactionHash', hash => {
          txHash = hash
          spinner.text = `Deploying repository '${argv.name}' on ${pando.options.ethereum.network} through tx ${txHash}`
        })
        .then(receipt => {
          const address = receipt.logs.filter(l => l.event === 'CreateRepository')[0].args.repository
          spinner.succeed(`Repository '${argv.name}' deployed on ${pando.options.ethereum.network} at address ${address} through tx ${txHash}`)
          process.exit(0)
        })
        .catch(err => {
          spinner.fail(`Failed to deploy repository '${argv.name}' on ${pando.options.ethereum.network}: ` + err.message)
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
  desc: 'Deploy a new repository',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
