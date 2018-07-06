import Pando from '@pando/pando.js'
import * as config from '@lib/config'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = yargs => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    const pando = await Pando.load()
    const repository = await pando.repositories.load()
    await repository.pull(argv.remote, argv.branch)
    display.success(
      "Modifications pulled from '" + argv.remote + ':' + argv.branch + "''"
    )
  } catch (err) {
    display.error(err.message)
  }
}

export const pull = {
  command: 'pull <remote> <branch>',
  desc: 'Pull modifications from remote branch',
  builder: builder,
  handler: handler
}
