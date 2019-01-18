import Pando from '@pando/pando.js'
import Listr from 'listr'
import yargs from 'yargs'


const builder = () => {
  return yargs
    .strict(false)
    .help()
    .version(false)
}

const handler = async (argv) => {
  const pando = await Pando.create(argv.configuration)
  const tasks = new Listr([
  	{
  		title: 'Initializing pando plant',
  		task: async () => {
        const options = { ethereum: { account: '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7' } }
        const plant = await pando.plants.create()

      }
    }
  ])

  try {
    await tasks.run()
  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const init = {
  command: 'initialize',
  aliases: ['init'],
  desc: 'Initialize plant',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
