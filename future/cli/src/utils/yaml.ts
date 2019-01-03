import yaml from 'js-yaml'
import * as fs from './fs'

export const read = (path: string) => {
  return yaml.safeLoad(fs.read(path))
}

export const write = (path: string, data: any, opts?: any) => {
  return fs.write(path, yaml.safeDump(data, opts))
}
