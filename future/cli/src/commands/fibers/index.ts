import yargs from 'yargs'
import * as subcommands from './subcommands'

const builder = () => {
  return yargs
    .usage('pando fibers <subcommand>')
    .command(subcommands.list)
    .command(subcommands.create)
    .command(subcommands.delete_)
    .updateStrings({ 'Commands:': 'Subcommands:' })
    .demandCommand(1, 'No subcommand provided')
    .help()
    .version(false)
}
/* tslint:disable:object-literal-sort-keys */
export const fibers = {
  command: 'fibers <subcommand>',
  desc: 'Handle fibers',
  builder
}
/* tslint:enable:object-literal-sort-keys */
