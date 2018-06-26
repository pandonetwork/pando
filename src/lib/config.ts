import * as utils from '@utils'
import _path from 'path'
import os from 'os'

export const path = _path.join(os.homedir(), '.pandoconfig')


export const exists = (): boolean => {
  return utils.fs.exists(path)
}

export const save = (_data) => {
  return utils.yaml.write(path, _data)
}

export const load = () => {
  return utils.yaml.read(path)
}