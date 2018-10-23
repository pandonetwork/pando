import yargs from 'yargs'
import * as subcommands from './subcommands'

const builder = () => {
  return yargs
    .usage('pando branch <subcommand>')
    .command(subcommands.new_)
    .command(subcommands.checkout)
    .command(subcommands.current)
    .updateStrings({ 'Commands:': 'Subcommands:' })
    .demandCommand(1, 'No subcommand provided')
    .help()
    .version(false)
}
/* tslint:disable:object-literal-sort-keys */
export const branch = {
  command: 'branch <subcommand>',
  desc: 'Handle branches',
  builder
}
/* tslint:enable:object-literal-sort-keys */
