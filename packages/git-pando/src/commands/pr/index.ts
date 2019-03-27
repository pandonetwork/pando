import yargs from 'yargs'
import * as subcommands from './subcommands'

// OK
const builder = () => {
  return yargs
    .command(subcommands.open)
    .updateStrings({ 'Commands:': 'Subcommands:' })
    .demandCommand(1, 'No subcommand provided')
    .strict()
    .help()
    .version(false)
}

/* tslint:disable:object-literal-sort-keys */
export const pr = {
  command: 'pr <subcommand>',
  desc: 'Manage pando push requests',
  builder,
}
/* tslint:enable:object-literal-sort-keys */
