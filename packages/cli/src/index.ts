import * as commands from './commands'
import yargs from 'yargs'

var argv = yargs
  .usage('pando <command>')
  .command(commands.configure)
  .command(commands.init)
  .command(commands.stage)
  .command(commands.snapshot)
  .command(commands.fetch)
  .command(commands.push)
  .command(commands.branch)
  .command(commands.remote)
  .demandCommand(1, 'No command provided')
  .help()
  .alias('h', 'help').argv
