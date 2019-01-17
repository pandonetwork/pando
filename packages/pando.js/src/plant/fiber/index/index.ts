import fs from 'fs-extra'
import IPFS from 'ipfs'
import Level from 'level'
import levelup from 'levelup'
import npath from 'path'
import Fiber from '../'
import Repository from '../../'

import klaw from 'klaw'
import * as _ from 'lodash'
import stream from 'stream'
import through2 from 'through2'
import util from 'util'
import PandoError from '../../../error'

const ignore = through2.obj(function(item, enc, next) {
  // console.log(item.path)
  // console.log('IGNORE')
  if (!item.stats.isDirectory() && item.path.indexOf('.pando') < 0) {
    this.push(item)
  }
  next()
})

export default class Index {
  get plant(): Repository {
    return this.fiber.plant
  }

  get node(): IPFS {
    return this.plant.node
  }

  public static async for(fiber: Fiber): Promise<Index> {
    const index = new Index(fiber)
    await index.initialize()

    return index
  }

  public fiber: Fiber
  public db: Level

  constructor(fiber: Fiber) {
    this.fiber = fiber
    this.db = util.promisify(Level)(fiber.paths.index, { valueEncoding: 'json' })
  }

  public async initialize(): Promise<Index> {
    this.db = await this.db

    return this
  }

  public async current(): Promise<any> {
    const index = {}

    return new Promise(
      (resolve, reject): any => {
        const readStream = this.db.createReadStream()

        const writeStream = new stream.Writable({
          objectMode: true,
          write: async (file, encoding, next) => {
            index[file.key] = file.value
            next()
          },
        })

        writeStream
          .on('finish', () => {
            resolve(index)
          })
          .on('error', err => {
            reject(err)
          })

        readStream.pipe(writeStream).on('error', err => {
          reject(err)
        })
      }
    )
  }

  public async track(paths: string[]): Promise<any> {
    const { index, untracked, modified, deleted } = await this.status()

    const origin = paths

    paths = this.extract(paths, index)

    if (paths.length > 0) {
      for (const path of paths) {
        const value = await this.db.get(path)

        value.tracked = true

        await this.db.put(path, value)
      }
    } else {
      throw new PandoError('E_NO_INDEX_ENTRY_FOUND', origin)
    }

    return paths
  }

  public async untrack(paths: string[]): Promise<any> {
    const { index, untracked, modified, deleted } = await this.status()

    paths = this.extract(paths, index)

    for (const path of paths) {
      const value = await this.db.get(path)

      value.tracked = false

      await this.db.put(path, value)
    }
  }

  public async status(): Promise<any> {
    let files = {}
    const index = {}

    const untracked: string[] = []
    const unsnapshot: string[] = []
    const modified: string[] = []
    const deleted: string[] = []

    // IL FAUT AJOUTER UN OBJET ADDED QUI CORRESPOND AUX FICHIERS TRACKES DONT LE STAGE EST ENCORE NULL

    const updates: any[] = []

    return new Promise(
      async (resolve, reject): Promise<any> => {
        files = await this._ls()

        const readStream = this.db.createReadStream()

        const writeStream = new stream.Writable({
          objectMode: true,
          write: async (file, encoding, next) => {
            // if (file.value.tracked) { // file is tracked
            if (file.value.tracked && file.snapshot === 'null') {
              unsnapshot.push(file.key)
            }

            if (files[file.key]) {
              // file still exists in wdir
              if (new Date(file.value.mtime) < files[file.key].mtime) {
                // file has been modified since last index's update

                const cid = await this.cid(file.key)

                index[file.key] = {
                  mtime: files[file.key].mtime.toISOString(),
                  snapshot: file.value.snapshot,
                  tracked: file.value.tracked,
                  wdir: cid,
                }

                updates.push({ type: 'put', key: file.key, value: index[file.key] })

                // if (file.value.tracked) {
                //     console.log('Modified: ' + file.key)
                //     modified.push(file.key) // ONLY IF WDIR / STAGE
                // }
              } else {
                index[file.key] = file.value
              }

              if (file.value.tracked && index[file.key].wdir !== index[file.key].snapshot) {
                modified.push(file.key)
              }
              if (!file.value.tracked) {
                untracked.push(file.key)
              }
            } else {
              // file does not exist in wdir anymore
              if (file.value.snapshot === 'null') {
                delete index[file.key]
                updates.push({ type: 'del', key: file.key })
              } else {
                index[file.key] = {
                  mtime: new Date(Date.now()).toISOString(),
                  snapshot: file.value.snapshot,
                  tracked: file.value.tracked,
                  wdir: 'null',
                }
                updates.push({ type: 'put', key: file.key, value: index[file.key] })
                if (!file.value.tracked) {
                  untracked.push(file.key)
                }
              }

              if (file.value.tracked && file.value.snapshot !== 'null') {
                deleted.push(file.key)
              }
            }

            // } else { // file is untracked
            // untracked.push(file.key)

            // }

            delete files[file.key]
            next()
          },
        })

        writeStream
          .on('finish', async () => {
            for (const path in files) {
              if (files.hasOwnProperty(path)) {
                // file has been added since last index's update
                const cid = await this.cid(path)

                index[path] = {
                  mtime: files[path].mtime.toISOString(),
                  snapshot: 'null',
                  tracked: false,
                  wdir: cid,
                }

                updates.push({ type: 'put', key: path, value: index[path] })
                untracked.push(path)
              }
            }

            await this.db.batch(updates)

            resolve({ index, untracked, unsnapshot, modified, deleted })
          })
          .on('error', err => {
            reject(err)
          })

        readStream.pipe(writeStream).on('error', err => {
          reject(err)
        })
      }
    )
  }

  public async cid(path: string): Promise<string> {
    const data = [{ path, content: fs.readFileSync(npath.join(this.plant.paths.root, path)) }]
    const result = await this.node.files.add(data, { onlyHash: true })

    return result[0].hash
  }

  public async snapshot(opts?: any): Promise<any> {
    const { index, untracked, modified, deleted } = await this.status()

    const promises: any[] = []
    const updates: any[] = []

    for (const path of modified) {
      index[path].snapshot = index[path].wdir
      updates.push({ type: 'put', key: path, value: index[path] })
      promises.push(this.node.files.write('/' + path, fs.readFileSync(npath.join(this.plant.paths.root, path)), { create: true, parents: true }))
    }

    promises.push(this.db.batch(updates))

    await Promise.all(promises)

    const hash = (await this.node.files.stat('/', { hash: true })).hash

    return hash
  }

  public extract(paths: string[], index: any): string[] {
    const extracted = paths.map(path => {
      path = npath.relative(this.plant.paths.root, path)
      return _.filter(Object.keys(index), entry => {
        return entry.indexOf(path) === 0
      })
    })

    return _.uniq(_.flattenDeep(extracted))
  }

  private async _ls(): Promise<any> {
    const files = {}

    return new Promise(
      (resolve, reject): any => {
        klaw(this.plant.paths.root)
          .pipe(
            through2.obj(function(item, enc, next) {
              // ignore .pando directory
              if (item.path.indexOf('.pando') >= 0) {
                next()
              } else {
                this.push(item)
                next()
              }
            })
          )
          .pipe(
            through2.obj(function(item, enc, next) {
              // ignore directories
              if (item.stats.isDirectory()) {
                next()
              } else {
                this.push(item)
                next()
              }
            })
          )
          .on('data', file => {
            files[npath.relative(this.plant.paths.root, file.path)] = { mtime: file.stats.mtime }
          })
          .on('end', () => {
            resolve(files)
          })
      }
    )
  }

  private async clean(path: string): Promise<void> {
    let dir = npath.dirname(path)

    while (dir !== '.') {
      const stat = await this.node.files.stat('/' + dir)

      if (stat.type === 'directory' && stat.blocks === 0) {
        await this.node.files.rm('/' + dir, { recursive: true })
      } else {
        break
      }

      dir = npath.dirname(dir)
    }
  }
}
