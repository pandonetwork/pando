import chalk from 'chalk'
import Listr from 'listr'
import Pando from '@pando/pando.js'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('limit', {
      alias: 'l',
      description: 'Limit of past snapshots to display',
      required: false
    })
    .help()
    .strict(false)
    .version(false)
}

const handler = async (argv) => {
  const pando = await Pando.create(argv.configuration)

  try {
    const plant = await pando.plants.load()
    const fiber = await plant.fibers.current()
    const logs  = await fiber.log()

    for (let log_ of logs) {
      console.log(chalk.cyan.bold.underline('SNAPSHOT #' + log_.id) + ' ' + chalk.magenta.bold(log_.message))
      console.log(chalk.white(new Date(log_.timestamp).toString()))
      console.log(chalk.dim(log_.tree))
      console.log('')
    }

  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const log = {
  command: 'log',
  desc: 'Show snapshots log',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
