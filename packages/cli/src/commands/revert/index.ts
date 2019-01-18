import Pando from '@pando/pando.js'
import chalk from 'chalk'
import Listr from 'listr'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('snapshot', {
      alias: 's',
      description: 'Snapshot id to revert to',
      required: true
    })
    .help()
    .strict(false)
    .version(false)
}

const handler = async (argv) => {
  const pando = await Pando.create(argv.configuration)

  try {
    const plant = await pando.plants.load()
    const fiber = await plant.fibers.current()

    const tasks = new Listr([{
      title: 'Reverting to snapshot ' + argv.snapshot,
      task: async () => {
        await fiber.revert(argv.snapshot, argv.files)
      }
    }])

    await tasks.run()
  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const revert = {
  command: 'revert [files...]',
  desc: 'Revert to older version',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
