import Pando from '@pando/pando.js'
import { Repository } from '@pando/pando.js'
import * as config from '@lib/config'
import * as display from '@ui/display'
import Table from 'cli-table'
import yargs from 'yargs'

const builder = yargs => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    let pando = await Pando.load()
    let repository = await pando.repositories.load()
    let remote = await repository.remotes.load(argv.name)
    let infos = await remote.show()

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

    for (let branch in infos.branches) {
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

export const show = {
  command: 'show <name>',
  desc: 'Show remote informations',
  builder: builder,
  handler: handler
}
