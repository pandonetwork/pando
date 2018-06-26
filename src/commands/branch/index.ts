import * as subcommands from './subcommands'
import yargs            from 'yargs'


const builder = (yargs) => {
  return yargs
    .usage('pando branch <subcommand>')
    .command(subcommands.new_)
    .command(subcommands.checkout)
    .updateStrings({ 'Commands:': 'Subcommands:' })
    .demandCommand(1, 'No subcommand provided')
    .help()
    .version(false)
}

export const branch = {
  command: 'branch <subcommand>',
  desc:    'Handle branches',
  builder: builder
}