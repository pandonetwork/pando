import * as fs from 'fs'
import rimraf  from 'rimraf'

export const mkdir = (path: string) => {
  return fs.mkdirSync(path)
}

export const exists = (path: string): boolean => {
  return fs.existsSync(path)
}

export const write = (path: string, data: any) => {
  return fs.writeFileSync(path, data)
}

export const read = (_path: string) => {
  return fs.readFileSync(_path)
}

export const rm = (_path: string) => {
  return rimraf.sync(_path)
}
