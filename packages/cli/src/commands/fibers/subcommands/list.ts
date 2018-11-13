import Repository from '@pando/repository'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    // const pando = await Pando.load()
    // const repository = await pando.repositories.load()
    // const branchName = repository.currentBranchName
    // display.info('Currently on ' + branchName + ' branch')
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const list = {
  command: 'list',
  aliases: ['ls'],
  desc: 'List fibers',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
