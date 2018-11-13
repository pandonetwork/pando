import yargs from 'yargs'
import * as commands from './commands'

const argv = yargs
  .usage('pando <command>')
  // .command(commands.configure)
  .command(commands.init)
  .command(commands.track)
  .command(commands.untrack)
  .command(commands.status)
  .command(commands.fibers)
  // .command(commands.stage)
  // .command(commands.snapshot)
  // .command(commands.fetch)
  // .command(commands.push)
  // .command(commands.pull)
  // .command(commands.status)
  // .command(commands.log)
  // .command(commands.branch)
  // .command(commands.remote)
  // .command(commands.clone)
  .demandCommand(1, 'No command provided')
  .strict()
  .help()
  .alias('h', 'help').argv
