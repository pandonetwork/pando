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

    // const organization = await plant.organizations.deploy(argv.name)

    const tasks = new Listr([{
      title: `Deploying '${argv.name}'`,
      task: async (ctx, task) => {
        const organization = await plant.organizations.deploy(argv.name)
        task.title = `'${argv.name}' deployed at address ${organization.address}`
      }
    }])

    await tasks.run()
  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const deploy = {
  command: 'deploy <name>',
  desc: 'Deploy a new Aragon organization',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
