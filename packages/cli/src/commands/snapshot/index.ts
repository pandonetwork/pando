import Pando from '@pando/pando.js'
import Listr from 'listr'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('message', {
      alias: 'm',
      description: 'A message describing the snapshot',
      required: false
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
      title: 'Creating snapshot',
      task: async () => {
        await fiber.snapshot(argv.message)
      }
    }])

    await tasks.run()
  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const snapshot = {
  command: 'snapshot',
  desc: 'Snapshot modifications',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
