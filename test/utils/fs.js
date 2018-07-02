import * as fs from 'fs-extra'
import rimraf from 'rimraf'

export const mkdir = (path) => {
  return fs.mkdirSync(path)
}

export const exists = (path) => {
  return fs.existsSync(path)
}

export const rmdir = (path) => {
  // return fs.removeSync(path)
  return rimraf.sync(path)
}

export const write = (path, content) => {
  return fs.writeFileSync(path, content, 'utf8')
}

export const read = (path) => {
  return fs.readFileSync(path, 'utf8')
}

export const rm = (path) => {
  return fs.unlinkSync(path)
}
