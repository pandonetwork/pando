import Pando        from 'pando-lib'
import * as config  from '@lib/config'
import * as display from '@ui/display'
import yargs        from 'yargs'


const builder = (yargs) => {
  return yargs
    .option('message', {
      alias: 'm',
      description: 'A message describing the snapshot',
      required: true
    })
}

const handler = async (argv) => {
  try {
    display.info('Snapshotting modifications')
    let pando    = new Pando(config.load())
    let loom     = await pando.loom.load()
    let snapshot = await loom.snapshot(argv.message)
    let cid      = await snapshot.cid()
    display.success('Modifications snapshot with cid ' + cid.toBaseEncodedString())
  } catch (err) {
    display.error(err.message)
  }
}

export const snapshot = {
  command: 'snapshot',
  aliases: ['commit'],
  desc:    'Snapshot modifications',
  builder: builder,
  handler: handler
}