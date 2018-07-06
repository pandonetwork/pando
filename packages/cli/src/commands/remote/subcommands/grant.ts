import Pando from '@pando/pando.js'
import * as config from '@lib/config'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = yargs => {
  return yargs.help().version(false)
}

const handler = async argv => {
  try {
    let pando = await Pando.load()
    let repository = await pando.repositories.load()
    let remote = await repository.remotes.load(argv.remote)
    let receipt = await remote.grant(argv.role, argv.address)

    display.success(
      "Role '" +
        argv.role +
        "' granted to '" +
        argv.address +
        "' over remote '" +
        argv.remote +
        "' at tx " +
        receipt.tx
    )
  } catch (err) {
    display.error(err.message)
  }
}

export const grant = {
  command: 'grant <remote> <role> <address>',
  desc: 'Grant <address> role <role> over remote <remote>',
  builder,
  handler
}
