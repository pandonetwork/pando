import * as subcommands from './subcommands'
import yargs from 'yargs'

const builder = yargs => {
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

export const remote = {
  command: 'remote <subcommand>',
  desc: 'Handle remotes',
  builder: builder
}
