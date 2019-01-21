import Pando from '@pando/pando.js'
import chalk from 'chalk'
import Listr from 'listr'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('organization', {
      description: 'The organization the organism lives in',
      required: true,
    })
    .option('organism', {
      description: 'The organism to push the individuation to',
      required: true,
    })
    .option('message', {
      alias: 'm',
      description: 'A message describing the individuation',
      required: false,
    })
    .strict(false)
    .help()
    .version(false)
}

const handler = async argv => {
  const pando = await Pando.create(argv.configuration)

  try {
    const plant = await pando.plants.load()

    const tasks = new Listr([
      {
        title: `Pushing individuation to '${argv.organization}:${argv.organism}'`,
        task: async (ctx, task) => {
          await plant.publish(argv.organization, argv.organism, argv.message)
          task.title = `Individuation pushed to '${argv.organization}:${argv.organism}'`
        },
      },
    ])

    await tasks.run()
  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const individuate = {
  command: 'individuate',
  alias: 'indiv',
  desc: 'Individuate organism',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
