import Pando        from 'pando-lib'
import * as config  from '@lib/config'
import * as display from '@ui/display'
import yargs        from 'yargs'


const builder = (yargs) => {
  return yargs
    .help()
    .version(false)
}

const handler = async (argv: any) => {
  try {
    display.info('Staging ' + argv.files)
    let pando = new Pando(config.load())
    let loom  = await pando.loom.load(process.cwd())
    let index = await loom.stage(argv.files)  
    display.success('Modifications staged')
  } catch (err) {
    display.error(err.message)
  }

}

export const stage = {
  command: 'stage <files...>',
  aliases: ['add'],
  desc:    'Stage modifications',
  builder: builder,
  handler: handler
}