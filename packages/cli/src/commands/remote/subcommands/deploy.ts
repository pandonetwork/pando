import * as config from '@lib/config'
import Pando from '@pando/pando.js'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    const pando = await Pando.load()
    const repository = await pando.repositories.load()
    const remote = await repository.remotes.deploy(argv.name)
    display.status('deployed', remote.kernel.address)
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const deploy = {
  command: 'deploy <name>',
  desc: 'Deploy a new remote',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
