import find from 'find-up'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'


export default (): any => {
  const gitDir = find.sync('.git', { cwd: path.join(process.cwd(), '.git') })
  const LOCAL  = gitDir ? path.join(gitDir, 'pando', '.pandorc') : undefined
  const GLOBAL = path.join(os.homedir(), '.pandorc')
  const options = LOCAL && fs.pathExistsSync(LOCAL) ? LOCAL : GLOBAL

  return { gitDir, options }
}
