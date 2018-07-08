import * as config from '@lib/config'
import Pando from '@pando/pando.js'
import * as display from '@ui/display'
// import Table from 'cli-table'
import chalk from 'chalk'

import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('remote', {
      alias: 'r',
      description: 'The name of the remote on which to log branch',
      required: false
    })
    .help()
    .version(false)
}

const handler = async argv => {
  try {
    const pando = await Pando.load()
    const repository = await pando.repositories.load()
    const branch = argv.branch ? argv.branch : repository.currentBranchName
    const opts = argv.remote ? { remote: argv.remote } : undefined
    const fullBranchName = argv.remote ? argv.remote + ':' + branch : branch
    const head = repository.branches.head(branch, opts)
    const log = await repository.log(branch, opts)

    /* tslint:disable:no-console */
    console.log('[' + chalk.magenta(branch) + ']')
    console.log('')

    for (const snapshot of log) {
      const cid = (await snapshot.cid()).toBaseEncodedString()
      process.stdout.write(
        chalk.yellow('[' + cid + ']') +
          chalk.green('[' + new Date(snapshot.timestamp).toString() + ']')
      )
      if (cid === head) {
        console.log(
          '[' + chalk.blue('HEAD -> ') + chalk.magenta(fullBranchName) + ']'
        )
      } else {
        console.log()
      }
      console.log(chalk.grey('[author]\t') + snapshot.author.account)
      console.log(chalk.grey('[message]\t') + snapshot.message)
      console.log()
      /* tslint:enable:no-console */
    }
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const log = {
  command: 'log [branch]',
  desc: 'Show current branch history',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
