import Repository from '../'
import Fiber      from './'
import Level from 'level'
import npath from 'path'
import klaw from 'klaw'
import through2 from 'through2'
import fs from 'fs-extra'
import stream from 'stream'
import PandoError from '../error'


export default class FiberFactory {

    public repository: Repository
    public db: Level

    constructor(repository: Repository) {
        this.repository = repository
        this.db         = Level(npath.join(repository.paths.fibers, 'db'), { valueEncoding: 'json' })

    }

    public async uuid(name: string): Promise<string> {
        let uuid: string|undefined = undefined

        return new Promise<string>((resolve, reject) => {
            this.db
                .createReadStream()
                .on('data', fiber => {
                    if (fiber.value.name === name) { uuid = fiber.key }
                })
                .on('end', () => {
                    if (typeof uuid === 'undefined') {
                        reject(new PandoError('E_FIBER_NOT_FOUND', name))
                    } else {
                        resolve(uuid)
                    }
                })
                .on('error', (err) => {
                    reject (err)
                })
        })
    }

    public async current({ uuid = false }: { uuid?: boolean} = {}): Promise<Fiber|string|undefined> {
        let done: boolean = false

        return new Promise<Fiber|string|undefined>((resolve, reject) => {
            this.db
                .createReadStream()
                .on('data', async fiber => {
                    if (fiber.value.current) {
                        done = true
                        if (uuid) {
                            resolve(fiber.key)
                        } else {
                            resolve(await this.load(fiber.key, { uuid: true }))
                        }

                    }
                })
                .on('end', async () => {
                    if (!done) {
                        reject(new Error('Unknow current fiber'))
                    }

                })
                .on('error', err => {
                    reject(err)
                })
        })
    }

    public async create(name: string, { fork = true, open = false }: { fork?: boolean, open?: boolean } = {}): Promise<Fiber> {
        let fiber = await Fiber.create(this.repository)

        if (fork) {
            const current: string = await this.current({ uuid: true }) as string
            await fs.copy(npath.join(this.repository.paths.fibers, current, 'snapshots'), npath.join(this.repository.paths.fibers, fiber.uuid, 'snapshots'))
            await this._stash(fiber.uuid, { copy: true })
        }

        await this.db.put(fiber.uuid, { name, wdir: 'null', snapshot: 'null', current: false })

        if (open) {
            await fiber._open()
        }

        return fiber
    }

    public async load(name: string, { uuid = false }: { uuid?: boolean } = {}): Promise<Fiber> {
        name = uuid ? name : await this.uuid(name)

        return Fiber.load(this.repository, name)
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

    public async switch(name: string, { stash = true }: { stash?: boolean} = {}): Promise<any> {
        let from: string|undefined = undefined
        let to:   string|undefined = undefined
        let ops:  any[] = []

        return new Promise<Fiber>((resolve, reject) => {

            const read  = this.db.createReadStream()

            const write = new stream.Writable({
                objectMode: true,
                write: async (fiber, encoding, next) => {
                    if (fiber.value.current) {
                        from = fiber.key
                        ops.push({ type: 'put', key: fiber.key, value: { ...fiber.value, ...{ current: false } } })
                    }
                    if (fiber.value.name === name) {
                        to = fiber.key
                        ops.push({ type: 'put', key: fiber.key, value: { ...fiber.value, ...{ current: true } } })
                    }
                    next()
                }
            })

            write
                .on('finish', async () => {
                    if (stash) {
                        // throw if uuid is undefined


                        await this._stash(from as string)

                        await Promise.all([
                            // this._stash(from as string),
                            this._unstash(to as string),
                            this.db.batch(ops)
                        ])
                    } else {
                        await this.db.batch(ops)
                    }
                    resolve()
                })
                .on('error', err => { reject(err) })

            read
                .pipe(write)
                .on('error', err => { reject(err) })
        })
    }

    private async _stash(uuid: string, { copy = false }: { copy?: boolean} = {}): Promise<any> {
        const ops:any[]       = []
        const files: string[] = []

        return new Promise<any>((resolve, reject) => {
            klaw(this.repository.paths.root, { depthLimit: 0 })
                .pipe(through2.obj(function (item, enc, next) { // ignore .pando directory
                    if (item.path.indexOf('.pando') >= 0) {
                        next()
                    } else {
                        this.push(item)
                        next()
                    }
                }))
                .on('data', file => {
                    files.push(file.path)
                })
                .on('error', (err) => {
                    reject(err)
                })
                .on('end', async () => {
                    files.shift()

                    for (let file of files) {
                        if (copy) {
                            ops.push(fs.copy(file, npath.join(this.repository.paths.fibers, uuid, 'stash', npath.basename(file))))

                        } else {
                            ops.push(fs.move(file, npath.join(this.repository.paths.fibers, uuid, 'stash', npath.basename(file)), { overwrite: true }))

                        }

                    }

                    await Promise.all(ops)

                    resolve()
                })
        })
    }

    private async _unstash(uuid: string): Promise<any> {
        const ops:any[]       = []
        const files: string[] = []

        return new Promise<any>((resolve, reject) => {
            klaw(npath.join(this.repository.paths.fibers, uuid, 'stash'), { depthLimit: 0 })
                .on('data', file => {
                    files.push(file.path)
                })
                .on('error', (err) => {
                    reject(err)
                })
                .on('end', async () => {
                    files.shift()

                    for (let file of files) {
                        ops.push(fs.move(file, npath.join(this.repository.paths.root, npath.basename(file)), { overwrite: true }))
                    }

                    await Promise.all(ops)

                    resolve()
                })
        })
    }
}
