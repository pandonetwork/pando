import * as utils from '@utils'
import os from 'os'
import npath from 'path'


export const path = npath.join(os.homedir(), '.pandoconfig')

export const exists = (): boolean => {
  return utils.fs.exists(path)
}

export const save = (data: any) => {
  return utils.yaml.write(path, data)
}

export const load = () => {
  return utils.yaml.read(path)
}
