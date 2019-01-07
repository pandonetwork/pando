#!/usr/bin/env node

import path from 'path'
import find from 'find-up'
import fs from 'fs'
import yargs from 'yargs'
import * as commands from './commands'
import configuration from './configuration'


const config = configuration()

const argv = yargs
  .config(config)
  .usage('pando <command>')
  .command(commands.config)
  .command(commands.init)
  .command(commands.track)
  .command(commands.untrack)
  .command(commands.status)
  .command(commands.snapshot)
  .command(commands.log)
  .command(commands.revert)
  .command(commands.switch_)
  .command(commands.fibers)
  .command(commands.organizations)
  .command(commands.organisms)
  .command(commands.individuate)
  .demandCommand(1, 'No command provided')
  .strict()
  .help()
  .alias('h', 'help')
  .argv
