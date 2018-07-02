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
    await repository.branches.create(argv.name)
    display.success('Branch ' + argv.name + ' created')
  } catch (err) {
    display.error(err.message)
  }
}

export const new_ = {
  command: 'new <name>',
  desc: 'Create a new branch',
  builder: builder,
  handler: handler
}
