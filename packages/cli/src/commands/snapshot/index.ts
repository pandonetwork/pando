import * as config from '@lib/config'
import Pando from '@pando/pando.js'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('message', {
      alias: 'm',
      description: 'A message describing the snapshot',
      required: true
    })
    .help()
    .version(false)
}

const handler = async argv => {
  try {
    const pando = await Pando.load()
    const repository = await pando.repositories.load()
    const snapshot = await repository.snapshot(argv.message)
    const cid = await snapshot.cid()
    display.status('snapshot', cid.toBaseEncodedString())
  } catch (err) {
    display.error(err.message)
  }
}

export const snapshot = {
  command: 'snapshot',
  aliases: ['commit'],
  desc: 'Snapshot modifications',
  builder,
  handler
}
