import chalk from 'chalk'
import figures from 'figures'
import Pando from '@pando/pando.js'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .help()
    .strict(false)
    .version(false)
}

const handler = async (argv) => {
  const pando = await Pando.create(argv.configuration)

  try {
    const plant = await pando.plants.load()
    const fibers = await plant.fibers.list()

    for (let fiber of fibers) {
        if (fiber.current) {
            console.log(figures('❯ ') + chalk.green(fiber.name))
        } else {
            console.log(figures('  ') + fiber.name)
        }
    }
  } catch (err) {}

  await pando.close()
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
