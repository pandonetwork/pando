import Repository from '@pando/repository'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {

  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const delete_ = {
  command: 'delete <name>',
  desc: 'Delete fiber',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
