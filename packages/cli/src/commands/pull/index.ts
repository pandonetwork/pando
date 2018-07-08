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
    await repository.pull(argv.remote, argv.branch)
    display.status('pulled')
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const pull = {
  command: 'pull <remote> <branch>',
  desc: 'Pull modifications from remote branch',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
