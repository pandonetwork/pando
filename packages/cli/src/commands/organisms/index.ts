import yargs from 'yargs'
import * as subcommands from './subcommands'

const builder = () => {
  return yargs
    .usage('pando organisms <subcommand>')
    .command(subcommands.list)
    .command(subcommands.deploy)
    .command(subcommands.add)
    .updateStrings({ 'Commands:': 'Subcommands:' })
    .demandCommand(1, 'No subcommand provided')
    .strict()
    .help()
    .version(false)
}
/* tslint:disable:object-literal-sort-keys */
export const organisms = {
  command: 'organisms <subcommand>',
  desc: 'Handle organisms',
  builder,
}
/* tslint:enable:object-literal-sort-keys */
