import chalk from 'chalk'
import ora from 'ora'
import yargs from 'yargs'
import Pando from '../../../lib'
import options from '../../../util/options'

const builder = () => {
  return yargs
    .option('organization', {
      alias: 'dao',
      description: 'The Aragon organization to deploy the repository in',
      required: true,
    })
    .strict()
    .help()
    .version(false)
}

const handler = async argv => {
  const pando = await Pando.create(options())
  const spinner = ora(chalk.dim(`Deploying repository '${argv.name}'`)).start()

  try {
    const address = await pando.repositories.deploy(argv.organization, argv.name, '')
    spinner.succeed(chalk.dim(`Repository '${argv.name}' deployed at address ${address}`))
  } catch (err) {
    spinner.fail(chalk.dim(err.message))
  }

  process.exit(0)
}

/* tslint:disable:object-literal-sort-keys */
export const deploy = {
  command: 'deploy <name>',
  desc: 'Deploy a new repository',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
