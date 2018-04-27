import * as fs from 'fs'

export const mkdir = (path: string) => {
  return fs.mkdirSync(path)
}

export const exists = (path: string): boolean => {
  return fs.existsSync(path)
}
