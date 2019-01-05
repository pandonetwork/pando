import Listr from 'listr'
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

    const tasks = new Listr([{
      title: 'Swtiching to fiber ' + argv.name,
      task: async () => {
        await await plant.fibers.switch(argv.name)
      }
    }])

    await tasks.run()
  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const switch_ = {
  command: 'switch <name>',
  desc: 'Switch fibers',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
