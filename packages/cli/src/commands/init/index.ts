import Repository from '@pando/repository'
import * as display from '@ui/display'
import chalk from 'chalk'
import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async () => {
  // try {
  //   if (!config.exists()) {
  //     display.error('Pando not configured yet')
  //     display.error('Run pando config --global')
  //   } else {
  //     const pando = await Pando.create(config.load())
  //     const repository = await pando.repositories.create()
  //
  //     display.status('initialized', process.cwd())
  //   }
  // } catch (err) {
  //   display.error(err.message)
  // }

  console.log('INIT')

  await Repository.create(process.cwd())

}

/* tslint:disable:object-literal-sort-keys */
export const init = {
  command: 'initialize',
  aliases: ['init'],
  desc: 'Initialize repository',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
