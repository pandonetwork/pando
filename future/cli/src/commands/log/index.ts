import Repository from '@pando/repository'
import * as display from '@ui/display'
import chalk from 'chalk'
import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async (argv) => {
    try {
        const repository = await Repository.load()
        const fiber      = await repository.fibers.current()
        const logs       = await fiber.log()

        for (let log_ of logs) {
            console.log(chalk.cyan('snapshot #' + log_.id) + ' ' + chalk.magenta(new Date(log_.timestamp).toString()))
            // console.log('timestamp: ' + new Date(log_.timestamp))
            console.log(log_.message)
            console.log('')

        }
    } catch (err) {
        display.error(err.message)
    }
}

/* tslint:disable:object-literal-sort-keys */
export const log = {
  command: 'log',
  desc: 'Show snapshots log',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
