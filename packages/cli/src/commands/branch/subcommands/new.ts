import Pando        from 'pando-lib'
import * as config  from '@lib/config'
import * as display from '@ui/display'
import yargs        from 'yargs'


const builder = (yargs) => {
  return yargs
    .help()
    .version(false)
}

const handler = async (argv) => {
  try {
    display.info('Creating branch ' + argv.name)
    let pando    = new Pando(config.load())
    let loom     = await pando.loom.load()
    let snapshot = await loom.branch.new(argv.name)
    display.success('Branch ' + argv.name + ' created')
  } catch (err) {
    display.error(err.message)
  }
}

export const new_ = {
  command: 'new <name>',
  desc:    'Create a new branch',
  builder: builder,
  handler: handler
}