import find from 'find-up'
import fs from 'fs-extra'
import json from 'jsonfile'
import os from 'os'
import path from 'path'
import yargs from 'yargs'
import prompt from './questions'

const builder = () => {
  return yargs
    .option('global', {
      alias: 'g',
      describe: 'Configure pando globally',
      type: 'boolean',
    })
    .strict()
    .help()
    .version(false)
}

const handler = async argv => {
  try {
    if (argv.global) {
      const configuration = await prompt.configure()
      await fs.ensureFile(path.join(os.homedir(), '.pandorc'))
      await json.writeFile(path.join(os.homedir(), '.pandorc'), configuration)
    } else {
      const GIT_DIR = find.sync(['.git'])
      if (!GIT_DIR) {
        throw new Error('Not a git repository (or any of the parent directories)')
      }
      const configuration = await prompt.configure()

      await fs.ensureFile(path.join(GIT_DIR, 'pando', '.pandorc'))
      await json.writeFile(path.join(GIT_DIR, 'pando', '.pandorc'), configuration)
    }
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const config = {
  command: 'configure',
  aliases: ['config'],
  desc: 'Configure pando',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
