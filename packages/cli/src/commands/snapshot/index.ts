import Pando from '@pando/pando.js'
import * as config from '@lib/config'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = yargs => {
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
    let pando = await Pando.load()
    let repository = await pando.repositories.load()
    let snapshot = await repository.snapshot(argv.message)
    let cid = await snapshot.cid()
    display.success(
      'Modifications snapshot with cid ' + cid.toBaseEncodedString()
    )
  } catch (err) {
    display.error(err.message)
  }
}

export const snapshot = {
  command: 'snapshot',
  aliases: ['commit'],
  desc: 'Snapshot modifications',
  builder: builder,
  handler: handler
}
