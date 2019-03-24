import yargs from 'yargs'
import * as subcommands from './subcommands'

// OK
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
export const organization = {
  command: 'organization <subcommand>',
  aliases: ['dao'],
  desc: 'Manage pando organizations',
  builder,
}
/* tslint:enable:object-literal-sort-keys */
