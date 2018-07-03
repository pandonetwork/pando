import Pando from '@pando/pando.js'
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
    let heads = await repository.fetch(argv.remotes)

    const fetched = new Table({
      head: ['Remote', 'Branch', 'Head'],
      colWidths: [30, 30, 30]
    })

    for (const remote in heads) {
      if (heads.hasOwnProperty(remote)) {
        for (const branch in heads[remote]) {
          if (heads[remote].hasOwnProperty(branch)) {
            fetched.push([remote, branch, heads[remote][branch]])
          }
        }
      }
    }

    display.info(fetched.toString())
  } catch (err) {
    display.error(err.message)
  }
}

export const fetch = {
  command: 'fetch <remotes...>',
  desc: 'Fetch branches from one or more other repositories',
  builder: builder,
  handler: handler
}
