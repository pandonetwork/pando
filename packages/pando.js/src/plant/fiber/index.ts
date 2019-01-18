import fs from 'fs-extra'
import Level from 'level'
import * as _ from 'lodash'
import npath from 'path'
import util from 'util'
import uuidv1 from 'uuid/v1'
import Plant from '../'
import PandoError from '../../error'
import Index from './index/'

const db = async (location, options): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    Level(location, options, (err, dbs) => {
      if (err) {
        reject(err)
      } else {
        resolve(dbs)
      }
    })
  })
}

interface FiberPaths {
  root: string
  index: string
  snapshots: string
  stash: string
}

export default class Fiber {
  public static paths(plant: Plant, uuid: string, path: string): string {
    switch (path) {
      case 'root':
        return npath.join(plant.paths.fibers, uuid)
      case 'index':
        return npath.join(plant.paths.fibers, uuid, 'index')
      case 'snapshots':
        return npath.join(plant.paths.fibers, uuid, 'snapshots')
      case 'stash':
        return npath.join(plant.paths.fibers, uuid, 'stash')
      default:
        throw new Error('Unknown path')
    }
  }

  public plant: Plant
  public uuid: string
  public paths: FiberPaths
  public index!: Index
  public snapshots!: Level

  public constructor(plant: Plant, uuid: string) {
    this.plant = plant
    this.uuid = uuid
    this.paths = {
      index: Fiber.paths(plant, uuid, 'index'),
      root: Fiber.paths(plant, uuid, 'root'),
      snapshots: Fiber.paths(plant, uuid, 'snapshots'),
      stash: Fiber.paths(plant, uuid, 'stash'),
    }
  }

  public async initialize({ mkdir = false }: { mkdir?: boolean } = {}): Promise<Fiber> {
    if (mkdir) {
      fs.ensureDirSync(this.paths.stash)
    }

    ;[this.index, this.snapshots] = await Promise.all([Index.for(this), db(this.paths.snapshots, { valueEncoding: 'json' })])

    return this
  }

  public async status(): Promise<any> {
    return this.index.status()
  }

  public async snapshot(message: string = 'n/a'): Promise<any> {
    const id = await this._length()
    const tree = await this.index.snapshot()
    const snapshot = { id, timestamp: new Date(Date.now()).toISOString(), message, tree }

    await this.snapshots.put(id, snapshot)

    return snapshot
  }

  public async revert(id: number, paths: string[] = ['']): Promise<any> {
    let snapshot: any
    const promises: any[] = []
    let files: any[] = []

    try {
      snapshot = await this.snapshots.get(id)
    } catch (err) {
      if (err.notFound) {
        throw new PandoError('E_SNAPSHOT_NOT_FOUND')
      } else {
        throw err
      }
    }

    for (let path of paths) {
      path = npath.relative(this.plant.paths.root, path)
      const tree = await this.plant.node.files.get(snapshot.tree + '/' + path)

      if (tree.length <= 0) {
        throw new PandoError('E_ENTRY_NOT_FOUND_IN_SNAPSHOT', path, id)
      } else {
        for (const file of tree) {
          if (file.type === 'file') {
            files.push({
              content: file.content,
              destination:
                path.length > 0
                  ? npath.join(npath.dirname(path), file.path)
                  : file.path
                      .split(npath.sep)
                      .slice(1)
                      .join(npath.sep),
            })
          }
        }
      }
    }

    files = _.uniqBy(files, 'destination')

    await this.snapshot('Automatic snapshot before reverting to snapshot #' + id)

    for (const file of files) {
      promises.push(
        fs
          .ensureFile(npath.join(this.plant.paths.root, file.destination))
          .then(() => fs.writeFile(npath.join(this.plant.paths.root, file.destination), file.content))
      )
    }

    await Promise.all(promises)
  }

  public async log({ limit = 10 }: { limit?: number } = {}): Promise<any> {
    const snapshots: any[] = []

    return new Promise<any>((resolve, reject) => {
      this.snapshots
        .createReadStream({ reverse: true, limit, keys: false })
        .on('data', snapshot => {
          snapshots.push(snapshot)
        })
        .on('error', err => {
          reject(err)
        })
        .on('end', () => {
          resolve(snapshots)
        })
    })
  }

  public async _open(): Promise<void> {
    const ops: any[] = []

    if (this.snapshots.isClosed()) {
      ops.push(this.snapshots.open())
    }
    if (this.index.db.isClosed()) {
      ops.push(this.index.db.open())
    }

    await Promise.all(ops)
  }

  public async _close(): Promise<void> {
    const ops: any[] = []

    if (this.snapshots.isOpen()) {
      ops.push(this.snapshots.close())
    }
    if (this.index.db.isOpen()) {
      ops.push(this.index.db.close())
    }

    await Promise.all(ops)
  }

  private async _length(): Promise<number> {
    let length = 0

    return new Promise<any>(async (resolve, reject) => {
      this.snapshots
        .createReadStream({ reverse: true, limit: 1, values: false })
        .on('data', key => {
          length = parseInt(key, 10) + 1
        })
        .on('error', async err => {
          reject(err)
        })
        .on('end', async () => {
          resolve(length)
        })
    })
  }
}
