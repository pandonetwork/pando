import * as fs  from './fs'
import yaml     from 'js-yaml'

export const read = (_path: string) => {
  return yaml.safeLoad(fs.read(_path))
}

export const write = (_path: string, _data: any, opts?: any) => {
  return fs.write(_path, yaml.safeDump(_data, opts))
}
  
