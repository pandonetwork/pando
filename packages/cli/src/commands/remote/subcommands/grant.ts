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
    const remote = await repository.remotes.load(argv.remote)
    const receipt = await remote.grant(argv.role, argv.address)

    display.status('granted')
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const grant = {
  command: 'grant <remote> <role> <address>',
  desc: 'Grant <address> role <role> over remote <remote>',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
