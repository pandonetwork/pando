///<reference path="../../node_modules/@types/levelup/index.d.ts"/>


import Repository from '../'
import Index      from './index/'
import Level      from 'level'
import uuidv1     from 'uuid/v1'
import npath      from 'path'
import fs         from 'fs-extra'
import * as _     from 'lodash'
import util      from 'util'


const db = async (location, options): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        Level(location, options, function (err, dbs) {
            if (err) {
                reject(err)
            } else {

                resolve(dbs)
            }
        })
    })
}

export default class Fiber {
    public repository: Repository
    public uuid:       string
    public paths:      any
    public index!:     Index
    public snapshots!: Level

    public static paths(repository: Repository, uuid: string, path: string): string {
        switch (path) {
            case "root":
                return npath.join(repository.paths.fibers, uuid)
            case "index":
                return npath.join(repository.paths.fibers, uuid, 'index')
            case "snapshots":
                return npath.join(repository.paths.fibers, uuid, 'snapshots')
            default:
                throw new Error('Unknown path')
        }
    }

    public static async exists(repository: Repository, uuid: string): Promise<boolean> {

        // rewrite awith promise.all

        if(!(await fs.pathExists(npath.join(repository.paths.fibers, uuid)))) return false

        if(!(await fs.pathExists(npath.join(repository.paths.fibers, uuid, 'index')))) return false

        if(!(await fs.pathExists(npath.join(repository.paths.fibers, uuid, 'snapshots')))) return false

        return true
    }

    public static async create(repository: Repository, { open = false }: { open?: boolean} = {}): Promise<Fiber> {
        const fiber = new Fiber(repository, uuidv1())

        await fiber.initialize({ mkdir: true })

        if (!open) {
            await fiber.snapshots.close()
            await fiber.index.db.close()
        }

        return fiber
    }

    public static async load(repository: Repository, uuid: string): Promise<Fiber> {
        // TODO: check that fiber exists


        const fiber = new Fiber(repository, uuid)

        return fiber.initialize()
    }

    public async open(): Promise<void> {
        const ops: any[] = []

        if (this.snapshots.isClosed()) ops.push(this.snapshots.open())
        if (this.index.db.isClosed()) ops.push(this.index.db.open())

        await Promise.all(ops)
    }

    public async close(): Promise<void> {
        const ops: any[] = []

        if (this.snapshots.isOpen()) ops.push(this.snapshots.close())
        if (this.index.db.isOpen()) ops.push(this.index.db.close())

        await Promise.all(ops)
    }

    public constructor(repository: Repository, uuid: string) {
        this.repository = repository
        this.uuid       = uuid
        this.paths      = { root: npath.join(repository.paths.fibers, uuid), index: npath.join(repository.paths.fibers, uuid, 'index'), snapshots: npath.join(repository.paths.fibers, uuid, 'snapshots') }
    }

    public async initialize({ mkdir = false }: { mkdir?: boolean} = {}): Promise<Fiber> {
        if (mkdir) {
            fs.ensureDirSync(npath.join(this.repository.paths.fibers, this.uuid, 'stash'))
        }

        [this.index, this.snapshots] = await Promise.all([
            Index.for(this),
            db(this.paths.snapshots, { valueEncoding: 'json' })
        ])


        return this
    }

    public async status(): Promise<any> {
        return this.index.status()
    }

    public async snapshot(message: string = 'n/a'): Promise<any> {
        const id       = await this._length()
        const tree     = await this.index.snapshot()
        const snapshot = { id: id, timestamp: new Date(Date.now()).toISOString(), message, tree }

        await this.snapshots.put(id, snapshot)

        return snapshot
    }

    public async log({ limit = 10 }: { limit?: number} = {}): Promise<any> {
        const snapshots: any[] = []

        return new Promise<any>((resolve, reject) => {
            this.snapshots
                .createReadStream({ reverse: true, limit: limit, keys: false })
                .on('data',  snapshot => { snapshots.push(snapshot) })
                .on('error', err => { reject(err) })
                .on('end',   ()  => { resolve(snapshots) })
        })
    }

    private async _length(): Promise<number> {
        let length = 0

        return new Promise<any>(async (resolve, reject) => {
            this.snapshots
                .createReadStream({ reverse: true, limit: 1, values: false })
                .on('data',  key => {
                    length = parseInt(key) + 1 })
                .on('error', async err => {
                    reject(err)
                })
                .on('end',  async ()  => {
                    resolve(length) })
        })
    }
}
