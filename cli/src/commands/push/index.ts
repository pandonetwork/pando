import * as config from '@lib/config'
import Pando from '@pando/pando.js'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    const pando = await Pando.load()
    const repository = await pando.repositories.load()
    const receipt = await repository.push(argv.remote, argv.branch)
    display.status('pushed', receipt.tx)
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const push = {
  command: 'push <remote> <branch>',
  desc: 'Push modifications to remote',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
