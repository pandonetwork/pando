import Repository from '@pando/repository'
import * as display from '@ui/display'
import chalk from 'chalk'
import yargs from 'yargs'



const builder = () => {
  return yargs.help().version(false)
}

const handler = async (argv: any) => {
  try {
    const repository = await Repository.load()
    await repository.fibers.switch(argv.name)
    display.success('Switched to fiber ' + argv.name)
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const switch_ = {
  command: 'switch <name>',
  desc: 'Switch fibers',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
