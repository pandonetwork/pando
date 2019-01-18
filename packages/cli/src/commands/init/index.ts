import Pando from '@pando/pando.js'
import chalk from 'chalk'
import ora from 'ora'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .strict(false)
    .help()
    .version(false)
}

const handler = async argv => {
  let pando
  let spinner

  try {
    spinner = ora(chalk.dim('Initializing plant')).start()
    pando = await Pando.create(argv.configuration)
    await pando.plants.create()

    spinner.succeed(chalk.dim('Plant initialized'))
  } catch (err) {
    spinner.fail(chalk.dim(err.message))
  }

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const init = {
  command: 'initialize',
  aliases: ['init'],
  desc: 'Initialize plant',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
