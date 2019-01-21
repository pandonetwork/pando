import Pando from '@pando/pando.js'
import chalk from 'chalk'
import ora from 'ora'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .help()
    .strict(false)
    .version(false)
}

const handler = async argv => {
  let pando
  let spinner

  try {
    spinner = ora(chalk.dim(`Extracting fiber from ${argv.organism}`)).start()
    pando = await Pando.create(argv.configuration)
    const plant = await pando.plants.load()

    let [organizationName, organismName] = argv.organism.split(':')
    await plant.extract(organizationName, organismName)

    spinner.succeed(chalk.dim(`${argv.organism} extracted locally`))
  } catch (err) {
    spinner.fail(chalk.dim(err.message))
  }

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const extract = {
  command: 'extract <organism>',
  desc: 'Extract organism codebase into biome',
  builder,
  handler,
}
/* tslint:enable:object-literal-sort-keys */
