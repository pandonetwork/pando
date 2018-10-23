import yargs from 'yargs'
import * as subcommands from './subcommands'

const builder = () => {
  return yargs
    .usage('pando branch <subcommand>')
    .command(subcommands.deploy)
    .command(subcommands.add)
    .command(subcommands.show)
    .command(subcommands.grant)
    .updateStrings({ 'Commands:': 'Subcommands:' })
    .demandCommand(1, 'No subcommand provided')
    .help()
    .version(false)
}

/* tslint:disable:object-literal-sort-keys */
export const remote = {
  command: 'remote <subcommand>',
  desc: 'Handle remotes',
  builder
}
/* tslint:enable:object-literal-sort-keys */
