import Repository from '../'
import Fiber      from './'
import Level from 'level'
import npath from 'path'
import klaw from 'klaw'
import through2 from 'through2'
import fs from 'fs-extra'
import stream from 'stream'


export default class FiberFactory {

    public repository: Repository
    public db: Level

    constructor(repository: Repository) {
        this.repository = repository
        this.db         = Level(npath.join(repository.paths.fibers, 'db'), { valueEncoding: 'json' })

    }

    public async current({ uuid = false }: { uuid?: boolean} = {}): Promise<Fiber|string|undefined> {
        return new Promise<Fiber|string|undefined>((resolve, reject) => {
            this.db
                .createReadStream()
                .on('data', async fiber => {
                    if (fiber.value.current) {
                        if (uuid) {
                            resolve(fiber.key)
                        } else {
                            resolve(await this.load(fiber.key))
                        }

                    }
                })
                .on('end', async () => {
                    resolve(undefined)
                })
                .on('error', err => {
                    reject(err)
                })
        })
    }

    public async create(name: string): Promise<Fiber> {

        // put a fork option to copy the database of the current branch
        // copy the database from current branch to the newly created branch ?

        const fiber = await Fiber.create(this.repository)


        await this.db.put(fiber.uuid, { name, wdir: 'null', snapshot: 'null', current: false })

        return fiber
    }

    public async load(name: string): Promise<Fiber> {
        let uuid: string|undefined = undefined

        return new Promise<Fiber>((resolve, reject) => {
            this.db
                .createReadStream()
                .on('data', fiber => {
                    if (fiber.value.name === name) {
                        uuid = fiber.key
                    }
                })
                .on('end', async () => {
                    if (typeof uuid === 'undefined') {
                        reject(new Error('Unknown branch ' + name))
                    } else {
                        resolve(await Fiber.load(this.repository, uuid))
                    }
                }).
                on('error', (err) => {
                    reject (err)
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
                        console.log('Finish')
                        await Promise.all([
                            this._stash(from as string),
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

    private async _stash(uuid: string): Promise<any> {
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

                    // empty fibers/uuid/backup

                    for (let file of files) {
                        ops.push(fs.move(file, npath.join(this.repository.paths.fibers, uuid, 'stash', npath.basename(file))))
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

                    console.log('UNSTASH: ' + npath.join(this.repository.paths.fibers, uuid, 'stash'))
                    console.log(files)

                    for (let file of files) {

                        console.log('To move back: ' + file)

                        ops.push(fs.move(file, npath.join(this.repository.paths.root, npath.basename(file))))
                    }

                    await Promise.all(ops)

                    resolve()
                })
        })
    }
}
