///<reference path="../../node_modules/@types/levelup/index.d.ts"/>


import Repository from '../'
import Index      from './index/'
import Level      from 'level'
import uuidv1     from 'uuid/v1'
import npath      from 'path'
import fs         from 'fs-extra'
import * as _     from 'lodash'
import util      from 'util'
import PandoError from '../error'


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

interface FiberPaths {
    root: string,
    index: string,
    snapshots: string,
    stash: string
}

export default class Fiber {
    public repository: Repository
    public uuid:       string
    public paths:      FiberPaths
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
            case "stash":
                return npath.join(repository.paths.fibers, uuid, 'stash')
            default:
                throw new Error('Unknown path')
        }
    }

    /**
    * Check if a given fiber exists locally
    * @param repository Repository to check if the fiber exists in.
    * @param uuid       UUID of the fiber.
    * @returns          Returns true if the fiber exists locally, returns else otherwise.
    */
    public static async exists(repository: Repository, uuid: string): Promise<boolean> {
        let [one, two, three] = await Promise.all([
            fs.pathExists(Fiber.paths(repository, uuid, 'root')),
            fs.pathExists(Fiber.paths(repository, uuid, 'index')),
            fs.pathExists(Fiber.paths(repository, uuid, 'snapshots')),
            fs.pathExists(Fiber.paths(repository, uuid, 'stash'))
        ])

        return one && two && three
    }

    public static async create(repository: Repository, { open = false }: { open?: boolean} = {}): Promise<Fiber> {
        const fiber = new Fiber(repository, uuidv1())

        await fiber._initialize({ mkdir: true })

        if (!open) {
            await fiber._close()
        }

        return fiber
    }

    public static async load(repository: Repository, uuid: string): Promise<Fiber> {
        if (!await Fiber.exists(repository, uuid)) {
            throw new PandoError('E_FIBER_NOT_FOUND', uuid)
        }

        const fiber = new Fiber(repository, uuid)

        return fiber._initialize()
    }

    public constructor(repository: Repository, uuid: string) {
        this.repository = repository
        this.uuid       = uuid
        this.paths      = {
            root: Fiber.paths(repository, uuid, 'root'),
            index: Fiber.paths(repository, uuid, 'index'),
            snapshots: Fiber.paths(repository, uuid, 'snapshots'),
            stash: Fiber.paths(repository, uuid, 'stash')
        }
    }

    private async _initialize({ mkdir = false }: { mkdir?: boolean} = {}): Promise<Fiber> {
        if (mkdir) {
            fs.ensureDirSync(this.paths.stash)
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

    public async revert(id: number, paths: string[] = ['']): Promise<any> {

        let snapshot = await this.snapshots.get(id)
        let promises: any[] = []
        let files: any[] = []

        for (let path of paths) {
            path = npath.relative(this.repository.paths.root, path)
            const tree = await this.repository.node.files.get(snapshot.tree + '/' + path)

            console.log(tree)


            if (tree.length <= 0) {
                throw new PandoError('E_ENTRY_NOT_FOUND_IN_SNAPSHOT', path, id)
            } else {
                for (let file of tree) {
                    if (file.type === 'file') {
                        files.push({ destination: path.length > 0 ? npath.join(npath.dirname(path), file.path) : file.path.split(npath.sep).slice(1).join(npath.sep), content: file.content })
                    }
                }
            }
        }

        files = _.uniqBy(files, 'destination')

        await this.snapshot('Automatic snapshot before reverting to snapshot #' + id)

        for (let file of files) {
            promises.push(fs.ensureFile(npath.join(this.repository.paths.root, file.destination)).then(() => fs.writeFile(npath.join(this.repository.paths.root, file.destination), file.content)))
        }


        await Promise.all(promises)
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

    public async _open(): Promise<void> {
        const ops: any[] = []

        if (this.snapshots.isClosed()) ops.push(this.snapshots.open())
        if (this.index.db.isClosed()) ops.push(this.index.db.open())

        await Promise.all(ops)
    }

    public async _close(): Promise<void> {
        const ops: any[] = []

        if (this.snapshots.isOpen()) ops.push(this.snapshots.close())
        if (this.index.db.isOpen()) ops.push(this.index.db.close())

        await Promise.all(ops)
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
