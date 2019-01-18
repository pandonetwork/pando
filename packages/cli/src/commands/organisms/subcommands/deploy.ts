import Pando from '@pando/pando.js'
import Listr from 'listr'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('organization', {
      alias: 'o',
      description: 'The organization to deploy the organism in',
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
    const organization = await plant.organizations.load({ name: argv.organization })
    
    const tasks = new Listr([{
      title: `Deploying '${argv.name}'`,
      task: async (ctx, task) => {
        const organism = await organization.organisms.deploy(argv.name)
        task.title = `'${argv.name}' deployed at address ${organism.address}`
      }
    }])

    await tasks.run()
  } catch (err) {
    console.log(err)
  }

  await pando.close()

}

/* tslint:disable:object-literal-sort-keys */
export const deploy = {
  command: 'deploy <name>',
  desc: 'Deploy a new organism',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
