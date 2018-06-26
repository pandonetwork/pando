import Pando        from 'pando-lib'
import * as config  from '@lib/config'
import * as display from '@ui/display'
import yargs        from 'yargs'

const handler = async () => {
  try {
    display.info('Initializing repository')
    if (!config.exists()) {
      display.error('Pando not configured yet')
      display.error('Run pando config')
    }
    else {
      let pando = new Pando(config.load())
      let loom = await pando.loom.new()
      display.success('Repository initialized at ' + process.cwd())
    }
  } catch (err) {
    display.error(err.message)
  }
}

export const init = {
  command: 'initialize',
  aliases: ['init'],
  desc:    'Initialize repository',
  builder: () => {},
  handler: handler
}