import find from 'find-up'
import os from 'os'
import path from 'path'


export default (): any => {
  const gitDir  = find.sync('.git', { cwd: path.join(process.cwd(), '.git') })
  const options = gitDir ? find.sync('pandorc', { cwd: path.join(gitDir, 'pando') }) : path.join(os.homedir(), '.pandorc')

  return { gitDir, options }
}
