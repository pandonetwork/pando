import chalk from 'chalk'
import figures from 'figures'
import Pando from '@pando/pando.js'
import yargs from 'yargs'

const builder = () => {
  return yargs
    .option('organization', {
      alias: 'o',
      description: 'The organization to list organisms in',
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
    const organization = await plant.organizations.load({ name: argv. organization })
    const organisms = await organization.organisms.list()

    for (let organism of organisms) {
      console.log(chalk.cyan.bold.underline(organism.name) + ' ' + chalk.magenta.bold(organism.address))
      // console.log(chalk.white('ACL   ') + ' ' + chalk.dim(organization.acl))
      // console.log(chalk.white('Colony') + ' ' + chalk.dim(organization.colony))
      // console.log(chalk.white('Scheme') + ' ' + chalk.dim(organization.scheme))
      console.log('')
    }
  } catch (err) {}

  await pando.close()
}

/* tslint:disable:object-literal-sort-keys */
export const list = {
  command: 'list',
  aliases: ['ls'],
  desc: 'List organizations',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
