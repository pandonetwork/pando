import chalk from 'chalk'
import Listr from 'listr'
import Pando from '@pando/pando.js'
import yargs from 'yargs'


const builder = () => {
  return yargs
    .strict(false)
    .help()
    .version(false)
}

const handler = async (argv) => {
  const pando = await Pando.create(argv.configuration)

  try {
    const plant  = await pando.plants.load()
    const fiber  = await plant.fibers.current()
    const status = await fiber.status()

    // console.log(status)

    if (status.modified.length > 0) {
        console.log(chalk.green.bold.underline('Tracked files with modifications'))
        console.log('➜ these files will be automatically considered for snapshot')
        console.log("➜ use pando untrack <f> if you don't want to track modifications to file f")
        console.log('')
        for (let file of status.modified) {
            console.log('+ ' + file)
        }
        console.log('')
    }

    if (status.untracked.length > 0) {
        console.log(chalk.yellow.bold.underline('Untracked files'))
        console.log("➜ these files won't be considered for snapshot")
        console.log("➜ use pando track <f> if you want to track modifications to file f")
        console.log('')
        for (let file of status.untracked) {
            console.log('+ ' + file)
        }
        console.log('')
    }

  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const status = {
  command: 'status',
  desc: 'Show plant status',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
