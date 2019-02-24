#!/usr/bin/env node

import yargs from 'yargs'
import * as commands from './commands'
import configuration from './configuration'
// 
// const c = configuration()
//
// console.log(c)

const argv = yargs
  .config(configuration())
  .usage('pando <command>')
  .command(commands.config)
  .command(commands.organization)
  .command(commands.repository)
  .demandCommand(1, 'No command provided')
  .strict()
  .help()
  .alias('h', 'help').argv
