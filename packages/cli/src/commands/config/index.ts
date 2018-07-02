import Pando from '@pando/pando.js'
import { Repository } from '@pando/pando.js'
import * as config from '@lib/config'
import * as display from '@ui/display'
import yargs from 'yargs'
import prompt from '@ui/inquirer'

const builder = yargs => {
  return yargs
    .option('global', {
      alias: 'g',
      describe: 'Configure pando globally',
      type: 'boolean'
    })
    .help()
    .version(false)
}

const handler = async argv => {
  try {
    if (argv.global) {
      let configuration = await prompt.configure()
      config.save(configuration)
      display.success('Global pando configuration updated')
    } else {
      let configuration = await prompt.configure()
      let pando = await Pando.create(configuration)
      let repository = await pando.repositories.load()
      repository.config = configuration
      display.success('Local pando configuration updated')
    }
  } catch (err) {
    display.error(err.message)
  }
}

export const configure = {
  command: 'configure',
  aliases: ['config'],
  desc: 'Configure pando',
  builder: builder,
  handler: handler
}
