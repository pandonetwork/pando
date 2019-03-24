import readline from 'readline'

export default class LineHelper {
  private _buffer: any[]
  private _done: boolean

  // OK
  constructor() {
    this._buffer = []
    this._done = false
  }

  // OK
  public async next(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this._buffer.length > 0) {
        resolve(this._buffer.shift())
      } else {
        this._done = false
        const read = readline.createInterface({ input: process.stdin, output: process.stdout })
        read.on('line', line => {
          if (!this._done) {
            this._done = true
            read.close()
            resolve(line)
          } else {
            this._buffer.push(line)
          }
        })
      }
    })
  }
}
