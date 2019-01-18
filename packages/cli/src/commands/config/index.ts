import json from 'jsonfile'
import os from 'os'
import path from 'path'
import yargs from 'yargs'
import * as display from '../../ui/display'
import prompt from '../../ui/inquirer'

const builder = () => {
  return yargs
    .option('global', {
      alias: 'g',
      describe: 'Configure pando globally',
      type: 'boolean',
    })
    .strict(false)
    .help()
    .version(false)
}

const handler = async argv => {
  try {
    const configuration = await prompt.configure()

    if (argv.global) {
      await json.writeFile(path.join(os.homedir(), '.pandorc'), configuration)
    } else {
      await json.writeFile(path.join(process.cwd(), '.pando', '.pandorc'), configuration)
    }
  } catch (err) {
    console.log(err)
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
