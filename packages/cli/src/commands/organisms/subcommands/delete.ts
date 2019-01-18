import Pando from '@pando/pando.js'
import Listr from 'listr'
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

    const tasks = new Listr([{
      title: 'Deleting fiber ' + argv.name,
      task: async () => {
        // await await plant.fibers.delete(argv.name)
      }
    }])

    await tasks.run()
  } catch (err) {}

  await pando.close()
}


/* tslint:disable:object-literal-sort-keys */
export const delete_ = {
  command: 'delete <name>',
  desc: 'Delete fiber',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
