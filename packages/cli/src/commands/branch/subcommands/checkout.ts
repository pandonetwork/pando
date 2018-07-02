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
    await repository.branches.checkout(argv.name)
    display.success('Checked out to branch ' + argv.name)
  } catch (err) {
    display.error(err.message)
  }
}

export const checkout = {
  command: 'checkout <name>',
  desc: 'Checkout to another branch',
  builder: builder,
  handler: handler
}
