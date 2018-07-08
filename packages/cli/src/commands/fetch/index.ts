import * as config from '@lib/config'
import Pando from '@pando/pando.js'
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
    const heads = await repository.fetch(argv.remotes)

    display.status('fetched')
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const fetch = {
  command: 'fetch <remotes...>',
  desc: 'Fetch branches from one or more other repositories',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
