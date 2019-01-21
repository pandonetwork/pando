#!/usr/bin/env node

import find from 'find-up'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import * as commands from './commands'
import configuration from './configuration'

const argv = yargs
  .config(configuration())
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
  .command(commands.extract)
  .demandCommand(1, 'No command provided')
  .strict()
  .help()
  .alias('h', 'help').argv
