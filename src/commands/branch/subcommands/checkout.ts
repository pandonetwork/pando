import Pando        from 'pando-lib'
import * as config  from '@lib/config'
import * as display from '@ui/display'
import yargs        from 'yargs'


const builder = (yargs) => {}

const handler = async (argv) => {
  try {
    display.info('Checking out to branch ' + argv.name)
    let pando    = new Pando(config.load())
    let loom     = await pando.loom.load()
    let snapshot = await loom.checkout(argv.name)
    display.success('Checked out to branch ' + argv.name)
  } catch (err) {
    display.error(err.message)
  }
}

export const checkout = {
  command: 'checkout <name>',
  desc:    'Checkout to another branch',
  builder: builder,
  handler: handler
}