import Pando        from 'pando-lib'
import { Loom }     from 'pando-lib'
import * as config  from '@lib/config'
import * as display from '@ui/display'
import yargs        from 'yargs'
import prompt       from '@ui/inquirer'

const builder = (yargs) => {
  return yargs
    .option('global', {
      alias: 'g',
      describe: 'verbose2 output',
      type: 'boolean'
    })
}

const handler = async (argv) => {
  try {
    if (argv.global) {
      let configuration = await prompt.configure()
      config.save(configuration)
      display.success('Global pando configuration updated')
    }
    else {
      if (!Loom.exists()) {
        throw new Error('No repository found at ' + process.cwd())
      }
      let configuration = await prompt.configure()
      let loom = await Loom.load()
      loom.config = configuration
      display.success('Local pando configuration updated')
    }
  } catch (err) {
    display.error(err.message)
  }
}

export const configure = {
  command: 'configure',
  aliases: ['config'],
  desc:    'Configure pando',
  builder: builder,
  handler: handler
}