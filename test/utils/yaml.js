import * as fs  from './fs'
import yaml     from 'js-yaml'

export const read = (_path) => {
  return yaml.safeLoad(fs.read(_path))
}

export const write = (_path, _data, opts) => {
  return fs.write(_path, yaml.safeDump(_data, opts))
}
  
