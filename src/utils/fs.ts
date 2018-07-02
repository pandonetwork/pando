import * as fs from 'fs'
import rimraf from 'rimraf'

export const read = (path: string) => {
  return fs.readFileSync(path)
}

export const write = (path: string, data: any) => {
  return fs.writeFileSync(path, data)
}

export const exists = (path: string): boolean => {
  return fs.existsSync(path)
}

export const rm = (path: string) => {
  return rimraf.sync(path)
}

export const mkdir = (path: string) => {
  return fs.mkdirSync(path)
}
