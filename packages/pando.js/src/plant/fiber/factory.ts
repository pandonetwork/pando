import fs from 'fs-extra'
import klaw from 'klaw'
import Level from 'level'
import npath from 'path'
import stream from 'stream'
import through2 from 'through2'
import uuidv1 from 'uuid/v1'
import Plant from '../'
import PandoError from '../../error'
import Fiber from './'

export default class FiberFactory {
  public plant: Plant
  public db: Level

  constructor(plant: Plant) {
    this.plant = plant
    this.db = Level(npath.join(plant.paths.fibers, 'db'), { valueEncoding: 'json' })
  }

  public async exists(nameOrUuid: string, { uuid = false }: { uuid?: boolean } = {}): Promise<boolean> {
    const uuid_: string | undefined = uuid ? nameOrUuid : await this.uuid(nameOrUuid)

    if (typeof uuid_ === 'undefined') {
      return false
    }

    return new Promise<boolean>((resolve, reject) => {
      this.db.get(uuid_, (err, value) => {
        if (err) {
          if (err.notFound) {
            resolve(false)
          } else {
            reject(err)
          }
        } else {
          resolve(true)
        }
      })
    })
  }

  public async create(name: string, { fork = true, open = false }: { fork?: boolean; open?: boolean } = {}): Promise<Fiber> {
    if (await this.exists(name)) {
      throw new PandoError('E_FIBER_NAME_ALREADY_EXISTS', name)
    }

    const fiber = new Fiber(this.plant, uuidv1())
    await fiber.initialize({ mkdir: true })

    if (fork) {
      const current: string = (await this.current({ uuid: true })) as string
      await fs.copy(npath.join(this.plant.paths.fibers, current, 'snapshots'), npath.join(this.plant.paths.fibers, fiber.uuid, 'snapshots'))
      await this._stash(fiber.uuid, { copy: true })
    }

    if (!open) {
      await fiber._close()
    }

    await this.db.put(fiber.uuid, { name, wdir: 'null', snapshot: 'null', current: false })

    return fiber
  }

  public async load(nameOrUuid: string, { uuid = false }: { uuid?: boolean } = {}): Promise<Fiber> {
    if (!(await this.exists(nameOrUuid, { uuid }))) {
      throw new PandoError('E_FIBER_NOT_FOUND')
    }

    const uuid_: string | undefined = uuid ? nameOrUuid : await this.uuid(nameOrUuid)
    const fiber = new Fiber(this.plant, uuid_ as string)

    await fiber.initialize()

    return fiber
  }

  public async uuid(name: string): Promise<string | undefined> {
    let uuid: string | undefined

    return new Promise<string | undefined>((resolve, reject) => {
      this.db
        .createReadStream()
        .on('data', fiber => {
          if (fiber.value.name === name) {
            uuid = fiber.key
          }
        })
        .on('end', () => {
          resolve(uuid)
        })
        .on('error', err => {
          reject(err)
        })
    })
  }

  public async current({ uuid = false }: { uuid?: boolean } = {}): Promise<Fiber | string | undefined> {
    let current: Fiber | string | undefined

    return new Promise<Fiber | string | undefined>((resolve, reject) => {
      const write = new stream.Writable({
        objectMode: true,
        write: async (fiber, encoding, next) => {
          if (fiber.value.current) {
            current = uuid ? fiber.key : await this.load(fiber.key, { uuid: true })
            // if (uuid) {
            //   current = fiber.key
            // } else {
            //   current = await this.load(fiber.key, { uuid: true })
            // }
          }
          next()
        },
      })

      write
        .on('finish', async () => {
          resolve(current)
        })
        .on('error', err => {
          reject(err)
        })

      this.db
        .createReadStream()
        .pipe(write)
        .on('error', err => {
          reject(err)
        })
    })
  }

  public async switch(name: string, { stash = true }: { stash?: boolean } = {}): Promise<void> {
    const ops: any[] = []
    const current: string | undefined = (await this.current({ uuid: true })) as string | undefined
    const to: string | undefined = await this.uuid(name)

    if (typeof to === 'undefined') {
      throw new PandoError('E_FIBER_NOT_FOUND')
    }

    if (typeof current !== 'undefined') {
      ops.push({ type: 'put', key: current, value: { ...(await this.db.get(current)), ...{ current: false } } })
      ops.push({ type: 'put', key: to, value: { ...(await this.db.get(to)), ...{ current: true } } })
    } else {
      ops.push({ type: 'put', key: to, value: { ...(await this.db.get(to)), ...{ current: true } } })
    }

    if (stash) {
      await this._stash(current as string)
      await Promise.all([this._unstash(to as string), this.db.batch(ops)])
    } else {
      await this.db.batch(ops)
    }
  }

  public async list(): Promise<any> {
    const fibers: any[] = []

    return new Promise<any>((resolve, reject) => {
      this.db
        .createReadStream()
        .on('data', async fiber => {
          fibers.push(fiber.value)
        })
        .on('end', async () => {
          resolve(fibers)
        })
        .on('error', err => {
          reject(err)
        })
    })
  }

  private async _stash(uuid: string, { copy = false }: { copy?: boolean } = {}): Promise<any> {
    const files: string[] = []
    const ops: any[] = []

    return new Promise<any>((resolve, reject) => {
      const write = new stream.Writable({
        objectMode: true,
        write: async (file, encoding, next) => {
          files.push(file.path)
          next()
        },
      })

      write
        .on('error', err => {
          reject(err)
        })
        .on('finish', async () => {
          for (const file of files) {
            if (copy) {
              ops.push(fs.copy(file, npath.join(this._paths(uuid, 'stash'), npath.relative(this.plant.paths.root, file))))
            } else {
              ops.push(fs.move(file, npath.join(this._paths(uuid, 'stash'), npath.relative(this.plant.paths.root, file)), { overwrite: true }))
            }
          }

          await Promise.all(ops)
          resolve()
        })

      this._ls(this.plant.paths.root).pipe(write)
    })
  }

  private async _unstash(uuid: string): Promise<any> {
    const files: string[] = []
    const ops: any[] = []

    return new Promise<any>((resolve, reject) => {
      const write = new stream.Writable({
        objectMode: true,
        write: async (file, encoding, next) => {
          files.push(file.path)
          next()
        },
      })

      write
        .on('finish', async () => {
          for (const file of files) {
            ops.push(fs.move(file, npath.join(this.plant.paths.root, npath.relative(this._paths(uuid, 'stash'), file)), { overwrite: true }))
          }

          await Promise.all(ops)
          resolve()
        })
        .on('error', err => {
          reject(err)
        })

      this._ls(this._paths(uuid, 'stash'), { all: true })
        .pipe(write)
        .on('error', err => {
          reject(err)
        })
    })
  }

  private _ls(path: string, { all = false }: { all?: boolean } = {}): any {
    return klaw(path).pipe(
      through2.obj(function(item, enc, next) {
        if (!all && item.path.indexOf('.pando') >= 0) {
          // ignore .pando directory
          next()
        } else if (item.stats.isDirectory()) {
          // ignore empty directories
          next()
        } else {
          this.push(item)
          next()
        }
      })
    )
  }

  private _paths(uuid: string, path: string): string {
    switch (path) {
      case 'stash':
        return npath.join(this.plant.paths.fibers, uuid, 'stash')
      default:
        throw new PandoError('E_PATH_UNKNOWN', path)
    }
  }
}
