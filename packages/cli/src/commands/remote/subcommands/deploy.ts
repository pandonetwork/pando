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
    let remote = await repository.remotes.deploy(argv.name)
    display.success(
      "Remote '" + argv.name + "' deployed at address " + remote.kernel.address
    )
  } catch (err) {
    display.error(err.message)
  }
}

export const deploy = {
  command: 'deploy <name>',
  desc: 'Deploy a new remote',
  builder: builder,
  handler: handler
}
