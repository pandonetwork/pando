import Pando from '@pando/pando.js'
import chalk from 'chalk'
import ora from 'ora'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('organization', {
      alias: 'o',
      description: 'The organization to deploy the organism in',
      required: true,
    })
    .help()
    .strict(false)
    .version(false)
}

const handler = async argv => {
  let pando
  let spinner

  try {
    spinner = ora(chalk.dim(`Deploying organism '${argv.name}'`)).start()
    pando = await Pando.create(argv.configuration)
    const plant = await pando.plants.load()
    const organization = await plant.organizations.load({ name: argv.organization })
    const organism = await organization.organisms.deploy(argv.name)
    spinner.succeed(chalk.dim(`Organism '${argv.name}' deployed at address ${organism.address}`))
  } catch (err) {
    spinner.fail(chalk.dim(err.message))
  }

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const deploy = {
  command: 'deploy <name>',
  desc: 'Deploy a new organism',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
