import * as config from '@lib/config'
import Pando from '@pando/pando.js'
import * as display from '@ui/display'
import yargs from 'yargs'

const builder = () => {
  return yargs.help().version(false)
}

const handler = async (argv: any) => {
  try {
    const pando = await Pando.load()
    const repository = await pando.repositories.load()
    await repository.stage(argv.files)
    display.status('staged')
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const stage = {
  command: 'stage <files...>',
  aliases: ['add'],
  desc: 'Stage modifications',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
