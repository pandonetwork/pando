import Repository from '@pando/repository'
import * as display from '@ui/display'
import chalk from 'chalk'
import yargs from 'yargs'



const builder = () => {
  return yargs.help().version(false)
}

const handler = async (argv: any) => {
  try {
    const repository = await Repository.load()
    const fiber      = await repository.fibers.current()
    const paths      = await fiber.index.track(argv.files)

    for (let path of paths) {
        display.success('File ' + path + ' tracked')
    }
  } catch (err) {
    display.error(err.message)
  }
}

/* tslint:disable:object-literal-sort-keys */
export const track = {
  command: 'track <files...>',
  desc: 'Track files for modifications',
  builder,
  handler
}
/* tslint:enable:object-literal-sort-keys */
