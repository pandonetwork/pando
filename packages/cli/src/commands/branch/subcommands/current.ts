import { Loom }     from 'pando-lib'
import * as config  from '@lib/config'
import * as display from '@ui/display'
import yargs        from 'yargs'


const builder = (yargs) => {
  return yargs
    .help()
    .version(false)
}

const handler = async (argv) => {
  try {
    let loom       = await Loom.load()
    let branchName = loom.currentBranchName
    display.info('Currently on ' + branchName + ' branch')
  } catch (err) {
    display.error(err.message)
  }
}

export const current = {
  command: 'current',
  desc:    'Print current branch name',
  builder: builder,
  handler: handler
}