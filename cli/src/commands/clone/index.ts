import * as config from '@lib/config'
import Pando from '@pando/pando.js'
import * as display from '@ui/display'

// import Table from 'cli-table'
import chalk from 'chalk'

import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    if (!config.exists()) {
      display.error('pando not configured yet')
      display.error('run pando config --global')
    } else {
      const pando = await Pando.create(config.load())
      const repository = await pando.repositories.clone(argv.address)

      display.status('cloned')
    }
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const clone = {
  command: 'clone <address>',
  desc: 'Clone remote repository',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
