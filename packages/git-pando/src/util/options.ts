import fs from 'fs-extra'
import die from './die'

export default (path: string): any => {
  if (!fs.pathExistsSync(path)) die("No configuration file found. Run 'git-pando config' and come back to us.")
  return JSON.parse(fs.readFileSync(path).toString())
}
