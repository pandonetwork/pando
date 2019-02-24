import yargs from 'yargs'
import * as subcommands from './subcommands'

const builder = () => {
  return yargs
    .command(subcommands.deploy)
    .updateStrings({ 'Commands:': 'Subcommands:' })
    .demandCommand(1, 'No subcommand provided')
    .strict()
    .help()
    .version(false)
}

/* tslint:disable:object-literal-sort-keys */
export const repository = {
  command: 'repository <subcommand>',
  desc: 'Manage pando repositories',
  builder,
}
/* tslint:enable:object-literal-sort-keys */
