import Repository from '../'
import Index      from './index/'
import Level      from 'level'
import uuidv1     from 'uuid/v1'
import npath      from 'path'
import fs         from 'fs-extra'
import * as _     from 'lodash'


export default class Fiber {
    public uuid: string
    public paths: any
    public repository: Repository
    public index: Index
    public snapshots: Level

    public static async exists(repository: Repository, uuid: string): Promise<boolean> {
        if(!(await fs.pathExists(npath.join(repository.paths.fibers, uuid)))) return false

        if(!(await fs.pathExists(npath.join(repository.paths.fibers, uuid, 'index')))) return false

        if(!(await fs.pathExists(npath.join(repository.paths.fibers, uuid, 'snapshots')))) return false

        return true
    }

    public static async create(repository: Repository): Promise<Fiber> {
        const uuid = uuidv1()
        fs.ensureDirSync(npath.join(repository.paths.fibers, uuid))
        fs.ensureDirSync(npath.join(repository.paths.fibers, uuid, 'stash'))


        return new Fiber(repository, uuid)
    }

    public static async load(repository: Repository, uuid: string): Promise<Fiber> {
        // TODO: check that fiber exists
        return new Fiber(repository, uuid)
    }

    public constructor(repository: Repository, uuid: string) {
        this.repository = repository
        this.uuid       = uuid
        this.paths      = { root: npath.join(repository.paths.fibers, uuid), index: npath.join(repository.paths.fibers, uuid, 'index'), snapshots: npath.join(repository.paths.fibers, uuid, 'snapshots') }
        this.index      = new Index(this)
        this.snapshots  = Level(this.paths.snapshots, { valueEncoding: 'json' })
    }

    public async status(): Promise<any> {
        return this.index.status()
    }

    public async snapshot(): Promise<any> {
        const id       = await this._length()
        const tree     = await this.index.snapshot()
        const snapshot = { id: id, timestamp: new Date(Date.now()).toISOString(), tree: tree }

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

        return new Promise<any>((resolve, reject) => {
            this.snapshots
                .createReadStream({ reverse: true, limit: 1, values: false })
                .on('data',  key => { length = parseInt(key) + 1 })
                .on('error', err => { reject(err) })
                .on('end',   ()  => { resolve(length) })
        })
    }
}
