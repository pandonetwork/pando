import APM from '@aragon/apm'
import defaultsDeep from 'lodash.defaultsdeep'
import ora from 'ora'
import Web3 from 'web3'
import yargs from 'yargs'
import die from '../../../lib/die'
import options from '../../../lib/options'
import Pando from '../../../lib/pando'

import shell from 'shelljs'

const builder = () => {
  return yargs
    .option('title', {
      alias: 't',
      description: 'Title of the pull request',
      required: true,
    })
    .option('description', {
      alias: 'd',
      description: 'Description of the pull request',
      required: false,
    })
    .strict()
    .help()
    .version(false)
}

const handler = async argv => {
  try {
    process.env.PANDO_OPEN_PR = 'true'
    process.env.PANDO_PR_TITLE = argv.title
    process.env.PANDO_PR_DESCRIPTION = argv.description

    const args = argv.gitArgs
      ? argv.gitArgs.reduce((acc, arg) => {
          return acc + ' ' + arg
        }, '')
      : ''
    const cmd = 'git push' + args
    shell.exec(cmd)
  } catch (err) {
    die(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const open = {
  command: 'open [gitArgs...]',
  desc: 'Open a pull request',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
