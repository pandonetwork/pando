import Repository from '@pando/repository'
import * as display from '@ui/display'
import chalk from 'chalk'
import yargs from 'yargs'

const builder = () => {
    return yargs
      .option('snapshot', {
        alias: 's',
        description: 'Snapshot id to revert to',
        required: false
      })
      .help()
      .version(false)
}

const handler = async (argv) => {
    try {

        let id = argv.snapshot ? argv.snapshot : 0

        console.log('ID: ' + id)

        const repository = await Repository.load()
        const fiber      = await repository.fibers.current()

        await fiber.revert(id, argv.files)

    } catch (err) {
        display.error(err.message)
    }
}

/* tslint:disable:object-literal-sort-keys */
export const revert = {
  command: 'revert [files...]',
  desc: 'Revert to older version',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
