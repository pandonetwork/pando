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
    await repository.branches.checkout(argv.name)
    display.success('Checked out to branch ' + argv.name)
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const checkout = {
  command: 'checkout <name>',
  desc: 'Checkout to another branch',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
