import * as subcommands from './subcommands'
import yargs            from 'yargs'


const builder = () => {
  return yargs
    .usage('pando branch <subcommand>')
    .command(subcommands.new_)
    .command(subcommands.checkout)
    .updateStrings({ 'Commands:': 'Subcommands:' })
    .demandCommand(1, 'No subcommand provided')
}

export const branch = {
  command: 'branch <subcommand>',
  desc:    'Handle branches',
  builder: builder
}