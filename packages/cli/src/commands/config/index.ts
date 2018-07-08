import * as config from '@lib/config'
import Pando from '@pando/pando.js'
import { Repository } from '@pando/pando.js'
import * as display from '@ui/display'
import prompt from '@ui/inquirer'
import yargs from 'yargs'

const builder = () => {
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
      const configuration = await prompt.configure()
      config.save(configuration)
    } else {
      const configuration = await prompt.configure()
      const pando = await Pando.create(configuration)
      const repository = await pando.repositories.load()
      repository.config = configuration
    }
    display.status('updated')
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const configure = {
  command: 'configure',
  aliases: ['config'],
  desc: 'Configure pando',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
