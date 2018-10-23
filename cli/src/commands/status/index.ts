import * as config from '@lib/config'
import Pando from '@pando/pando.js'
import * as display from '@ui/display'
import chalk from 'chalk'
import Table from 'cli-table'

import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    const pando = await Pando.load()
    const repository = await pando.repositories.load()
    const branch = repository.currentBranchName
    const status = await repository.status()

    /* tslint:disable:no-console */
    console.log('[' + chalk.magenta(branch) + ']')
    console.log()
    console.log(chalk.grey('Modifications to be snapshot'))
    for (const path of status.unsnapshot) {
      console.log('\t* ' + chalk.green(path))
    }
    console.log()
    console.log(chalk.grey('Modifications not staged for snapshot'))
    for (const path of status.modified) {
      console.log('\t* ' + chalk.red(path))
    }
    console.log()
    console.log(chalk.grey('Untracked files'))
    for (const path of status.untracked) {
      console.log('\t* ' + path)
    }
    console.log()
    /* tslint:enable:no-console */
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const status = {
  command: 'status',
  desc: 'Show working tree status',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
