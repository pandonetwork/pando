import find from 'find-up'
import fs from 'fs-extra'
import os from 'os'
import npath from 'path'
import die from './die'

// OK
const _path = (): string => {
  const GIT_DIR = find.sync('.git', { cwd: npath.join(process.cwd(), '.git') })
  const LOCAL = GIT_DIR ? npath.join(GIT_DIR, 'pando', '.pandorc') : undefined
  const GLOBAL = npath.join(os.homedir(), '.pandorc')

  return LOCAL && fs.pathExistsSync(LOCAL) ? LOCAL : GLOBAL
}

// OK
export default (): any => {
  const path = _path()
  if (!fs.pathExistsSync(path)) die("No configuration file found. Run 'git-pando config' and come back to us.")
  return JSON.parse(fs.readFileSync(path).toString())
}
