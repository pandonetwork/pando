import Pando from '@pando/pando.js'
import { Repository } from '@pando/pando.js'
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
    let branchName = repository.currentBranchName
    display.info('Currently on ' + branchName + ' branch')
  } catch (err) {
    display.error(err.message)
  }
}

export const current = {
  command: 'current',
  desc: 'Print current branch name',
  builder: builder,
  handler: handler
}
