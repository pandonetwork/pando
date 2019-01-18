import Pando from '@pando/pando.js'
import chalk from 'chalk'
import ora from 'ora'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .help()
    .strict(false)
    .version(false)
}

const handler = async argv => {
  let pando
  let spinner

  try {
    spinner = ora(chalk.dim(`Creating fiber '${argv.name}'`)).start()
    pando = await Pando.create(argv.configuration)
    const plant = await pando.plants.load()
    await plant.fibers.create(argv.name)

    spinner.succeed(chalk.dim(`Fiber '${argv.name}' created`))
  } catch (err) {
    spinner.fail(chalk.dim(err.message))
  }

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const create = {
  command: 'create <name>',
  desc: 'Create a new fiber',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
