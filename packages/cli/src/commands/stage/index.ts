import Pando from '@pando/pando.js'
import * as config from '@lib/config'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = yargs => {
  return yargs.help().version(false)
}

const handler = async (argv: any) => {
  try {
    let pando = await Pando.load()
    let repository = await pando.repositories.load()
    await repository.stage(argv.files)
    display.success('Modifications staged')
  } catch (err) {
    display.error(err.message)
  }
}

export const stage = {
  command: 'stage <files...>',
  aliases: ['add'],
  desc: 'Stage modifications',
  builder: builder,
  handler: handler
}
