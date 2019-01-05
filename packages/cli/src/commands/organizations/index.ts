import yargs from 'yargs'
import * as subcommands from './subcommands'

const builder = () => {
  return yargs
    .usage('pando organizations <subcommand>')
    .command(subcommands.list)
    .command(subcommands.deploy)
    // .command(subcommands.delete_)
    .updateStrings({ 'Commands:': 'Subcommands:' })
    .demandCommand(1, 'No subcommand provided')
    .strict()
    .help()
    .version(false)
}
/* tslint:disable:object-literal-sort-keys */
export const organizations = {
  command: 'organizations <subcommand>',
  desc: 'Handle Aragon organizations',
  builder
}
/* tslint:enable:object-literal-sort-keys */
