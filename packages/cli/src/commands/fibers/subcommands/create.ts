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
      title: 'Creating fiber ' + argv.name,
      task: async () => {
        await await plant.fibers.create(argv.name)
      }
    }])

    await tasks.run()
  } catch (err) {}

  await pando.close()
}



// const handler = async argv => {
//   try {
//       const repository = await Repository.load()
//
//       await repository.fibers.create(argv.name)
//
//
//       display.success('Fiber ' + argv.name + ' created')
//   } catch (err) {
//     display.error(err.message)
//   }
// }

/* tslint:disable:object-literal-sort-keys */
export const create = {
  command: 'create <name>',
  desc: 'Create a new fiber',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
