import * as jsonfile from 'jsonfile'

export const write = (path, object) => {
  jsonfile.writeFileSync(path, object)
}

export const read = (path) => {
  return jsonfile.readFileSync(path)
}