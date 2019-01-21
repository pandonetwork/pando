import Pando from '@pando/pando.js'
import chalk from 'chalk'
import ora from 'ora'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('name', {
      alias: 'n',
      description: 'The local name of the organization',
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
    spinner = ora(chalk.dim(`Adding organization '${argv.name}'`)).start()
    pando = await Pando.create(argv.configuration)
    const plant = await pando.plants.load()
    await plant.organizations.add(argv.name, argv.address)
    spinner.succeed(chalk.dim(`Organization '${argv.name}' added`))
  } catch (err) {
    spinner.fail(chalk.dim(err.message))
  }

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const add = {
  command: 'add <address>',
  desc: 'Add an already deployed organization to the plant',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
