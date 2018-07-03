import Pando from '@pando/pando.js'
import * as config from '@lib/config'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = yargs => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    let pando = await Pando.load()
    let repository = await pando.repositories.load()
    let remote = await repository.remotes.add(argv.name, argv.address)
    display.success("Remote '" + argv.name + "' added")
  } catch (err) {
    display.error(err.message)
  }
}

export const add = {
  command: 'add <name> <address>',
  desc: 'Add an existing remote',
  builder: builder,
  handler: handler
}
