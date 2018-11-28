import Repository from '@pando/repository'
import * as display from '@ui/display'
import yargs from 'yargs'
import chalk from 'chalk'
import figures from 'figures'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
      const repository = await Repository.load()
      const fibers     = await repository.fibers.list()

      for (let fiber of fibers) {
          if (fiber.current) {
              console.log(figures('❯\t') + chalk.green(fiber.name))
          } else {
              console.log(figures('\t') + fiber.name)
          }
      }
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const list = {
  command: 'list',
  aliases: ['ls'],
  desc: 'List fibers',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
