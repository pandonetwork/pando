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
    const plant = await pando.plants.load()
    const fiber = await plant.fibers.current()
    const list: any[] = []


    for (let path of argv.files) {
      let task = {
        title: 'untracking ' + path,
    		task: async () => {
          await fiber.index.untrack([path])
        }
      }
      list.push(task)
    }

    const tasks = new Listr(list)
    await tasks.run()
  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const untrack = {
  command: 'untrack <files...>',
  desc: 'Untrack files for modifications',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
