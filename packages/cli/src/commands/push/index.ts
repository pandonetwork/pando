import Pando from '@pando/pando.js'
import * as config from '@lib/config'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = yargs => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    let pando = await Pando.load()
    let repository = await pando.repositories.load()
    let receipt = await repository.push(argv.remote, argv.branch)
    display.success('Modifications pushed at tx ' + receipt.tx)
  } catch (err) {
    display.error(err.message)
  }
}

export const push = {
  command: 'push <remote> <branch>',
  desc: 'Push modifications to remote',
  builder: builder,
  handler: handler
}
