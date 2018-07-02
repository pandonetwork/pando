import Pando from '@pando/pando.js'
import * as config from '@lib/config'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = yargs => {
  return yargs.help().version(false)
}

const handler = async () => {
  try {
    if (!config.exists()) {
      display.error('Pando not configured yet')
      display.error('Run pando config --global')
    } else {
      let pando = await Pando.create(config.load())
      let repository = await pando.repositories.create()
      display.success('Repository initialized at ' + process.cwd())
    }
  } catch (err) {
    display.error(err.message)
  }
}

export const init = {
  command: 'initialize',
  aliases: ['init'],
  desc: 'Initialize repository',
  builder: builder,
  handler: handler
}
