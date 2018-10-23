import * as config from '@lib/config'
import Pando from '@pando/pando.js'
import { Repository } from '@pando/pando.js'
import * as display from '@ui/display'
import Table from 'cli-table'
import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    const pando = await Pando.load()
    const repository = await pando.repositories.load()
    const remote = await repository.remotes.load(argv.name)
    const infos = await remote.show()

    const components = new Table({
      head: ['Component', 'Address'],
      colWidths: [50, 50]
    })

    const branches = new Table({
      head: ['Branch', 'Head'],
      colWidths: [50, 50]
    })

    components.push(['Kernel', infos.kernel])
    components.push(['ACL', infos.acl])
    components.push(['Tree', infos.tree])

    for (const branch in infos.branches) {
      if (infos.branches.hasOwnProperty(branch)) {
        branches.push([branch, infos.branches[branch].head])
      }
    }

    display.info(components.toString())
    display.info(branches.toString())
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const show = {
  command: 'show <name>',
  desc: 'Show remote informations',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
