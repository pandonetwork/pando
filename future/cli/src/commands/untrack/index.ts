import Repository from '@pando/repository'
import * as display from '@ui/display'
import chalk from 'chalk'
import yargs from 'yargs'


const builder = () => {
  return yargs.help().version(false)
}

const handler = async (argv: any) => {
  try {
    const repository = await Repository.load()
    const fiber      = await repository.fibers.current()

    await fiber.index.untrack(argv.files)

    display.status('untracked')


  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const untrack = {
  command: 'untrack <files...>',
  desc: 'Untrack files for modifications',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
