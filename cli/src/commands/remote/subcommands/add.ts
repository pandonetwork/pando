import * as config from '@lib/config'
import Pando from '@pando/pando.js'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    const pando = await Pando.load()
    const repository = await pando.repositories.load()
    const remote = await repository.remotes.add(argv.name, argv.address)
    display.status('added')
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const add = {
  command: 'add <name> <address>',
  desc: 'Add an existing remote',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
