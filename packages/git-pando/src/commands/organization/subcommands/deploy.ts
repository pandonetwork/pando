import chalk from 'chalk'
import defaultsDeep from 'lodash.defaultsdeep'
import ora from 'ora'
import yargs from 'yargs'
import Pando from '../../../lib'
import options from '../../../util/options'

const builder = () => {
  return yargs
    .option('network', {
      alias: 'n',
      describe: 'Network you want to deploy the DAO to',
      choices: ['devchain', 'rinkeby'],
    })
    .strict()
    .help()
    .version(false)
}

const handler = async argv => {
  const pando = await Pando.create(defaultsDeep(options(), { ethereum: { network: argv.network } }))
  const spinner = ora(chalk.dim(`Deploying organization`)).start()

  try {
    const address = await pando.organizations.deploy()
    spinner.succeed(chalk.dim(`Organization deployed at address ${address}`))
  } catch (err) {
    spinner.fail(chalk.dim(err.message))
  }

  process.exit(0)
}

/* tslint:disable:object-literal-sort-keys */
export const deploy = {
  command: 'deploy',
  desc: 'Deploy a new pando organization',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
