import Repository from '@pando/repository'
import * as display from '@ui/display'
import chalk from 'chalk'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('message', {
      alias: 'm',
      description: 'A message describing the snapshot',
      required: false
    })
    .help()
    .version(false)
}

const handler = async (argv) => {
    try {
        const repository = await Repository.load()
        const fiber      = await repository.fibers.current()

        await fiber.snapshot(argv.message)

        display.success('Modifications snapshot')
    } catch (err) {
        display.error(err.message)
    }
}

/* tslint:disable:object-literal-sort-keys */
export const snapshot = {
  command: 'snapshot',
  desc: 'Snapshot modifications',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
