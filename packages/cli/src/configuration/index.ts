import find from 'find-up'
import fs from 'fs'
import path from 'path'

const defaults = {
  "ethereum":
    {
      "account": "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7"
    }
}

export default (): any => {
  const cpath = find.sync(['.pandorc', '.pandorc.json'], { cwd: path.join(process.cwd(), '.pando') })
  return cpath ? { configuration: JSON.parse(fs.readFileSync(cpath).toString()) } : { configuration: defaults }
}
