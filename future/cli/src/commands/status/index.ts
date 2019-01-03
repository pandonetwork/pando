import Repository from '@pando/repository'
import * as display from '@ui/display'
import chalk from 'chalk'
import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async () => {
    try {
        const repository = await Repository.load()
        const fiber      = await repository.fibers.current()
        const status     = await fiber.status()


        if(status.modified.length > 0) {
            console.log(chalk.green('Tracked files with modifications:'))
            console.log('\t➜ these files will be automatically considered for snapshot')
            console.log("\t➜ use pando untrack <f> if you don't want to track modifications to file f")
            console.log('')
            for (let file of status.modified) {
                console.log('\t\t' + file)
            }
        }
        if(status.untracked.length > 0) {
            console.log(chalk.green('Untracked files:'))
            console.log("\t➜ these won't be considered for snapshot")
            console.log("\t➜ use pando track <f> if you want to track modifications to file f")
            console.log('')
            for (let file of status.untracked) {
                console.log('\t\t' + file)
            }
        }
    } catch (err) {
        display.error(err.message)
    }
}

/* tslint:disable:object-literal-sort-keys */
export const status = {
  command: 'status',
  desc: 'Show repository status',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
