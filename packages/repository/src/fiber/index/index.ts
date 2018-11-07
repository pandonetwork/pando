
import levelup from 'levelup'
import fs from 'fs-extra'
import IPFS from 'ipfs'
import Level from 'level'
import npath from 'path'
import Repository from '../../'
import Fiber from '../'

import klaw from 'klaw'
import through2 from 'through2'
import stream from 'stream'
import * as _ from 'lodash'
import util      from 'util'


const ignore = through2.obj(function (item, enc, next) {
    // console.log(item.path)
    // console.log('IGNORE')
    if (!item.stats.isDirectory() && item.path.indexOf('.pando') < 0) {
        this.push(item)
    }
    next()
})


export default class Index {

    // public static async create(fiber: Fiber): Promise<Index> {
    //
    //     const db = Level(fiber.paths.index, { valueEncoding: 'json' })
    //
    //     return new Index(fiber, db)
    //
    //     // return new Promise<Index>((resolve, reject) => {
    //     //     const node = new IPFS({ repo: repository.paths.ipfs, start: false })
    //     //     node.on('ready', () => {
    //     //         Level(repository.paths.index, { valueEncoding: 'json' }, function (err, db) {
    //     //             if (err) reject(err)
    //     //
    //     //             resolve(new Index(repository, node, db))
    //     //         })
    //     //     })
    //     //     node.on('error', (error) => {
    //     //         reject(error)
    //     //     })
    //     // })
    // }

    public static async for(fiber: Fiber): Promise<Index> {
        const index = new Index(fiber)
        await index.initialize()

        return index
    }

    public fiber: Fiber
    public db: Level

    constructor(fiber: Fiber) {
        this.fiber = fiber
        this.db    = util.promisify(Level)(fiber.paths.index, { valueEncoding: 'json' })
    }

    public async initialize(): Promise<Index> {
        this.db = await this.db

        return this
    }

    get repository(): Repository {
        return this.fiber.repository
    }

    get node(): IPFS {
        return this.repository.node
    }

    public async current(): Promise<any> {
        const index = {}

        return new Promise((resolve, reject): any => {
            const readStream  = this.db.createReadStream()

            const writeStream = new stream.Writable({
                objectMode: true,
                write: async (file, encoding, next) => {
                    index[file.key] = file.value
                    next()
                }
            });

            writeStream
                .on('finish', () => { resolve(index) })
                .on('error', err => { reject(err) })

            readStream
                .pipe(writeStream)
                .on('error', err => { reject(err) })
        })
    }

    public async track(paths: string[]): Promise<any> {
        let { index, untracked, modified, deleted } = await this.status()

        paths = this.extract(paths, index)

        for (let path of paths) {
            let value = await this.db.get(path)

            value.tracked = true

            await this.db.put(path, value)
        }

    }

    public async untrack(paths: string[]): Promise<any> {
        let { index, untracked, modified, deleted } = await this.status()

        paths = this.extract(paths, index)

        for (let path of paths) {
            let value = await this.db.get(path)

            value.tracked = false

            await this.db.put(path, value)
        }

    }

    private async _ls(): Promise<any> {
        const files = {}

        return new Promise((resolve, reject): any => {
            klaw(this.repository.paths.root)
                .pipe(through2.obj(function (item, enc, next) { // ignore .pando directory
                    if (item.path.indexOf('.pando') >= 0) {
                        next()
                    } else {
                        this.push(item)
                        next()
                    }
                }))
                .pipe(through2.obj(function (item, enc, next) { // ignore directories
                    if (item.stats.isDirectory()) {
                        next()
                    } else {
                        this.push(item)
                        next()
                    }
                }))
                .on('data', file => {
                    files[npath.relative(this.repository.paths.root, file.path)] = { mtime: file.stats.mtime }
                })
                .on('end', () => { resolve(files) })
        })
    }

    public async status(): Promise<any> {
        let files = {}
        let index = {}

        const untracked:  string[] = []
        const unsnapshot: string[] = []
        const modified:   string[] = []
        const deleted:    string[] = []

        // IL FAUT AJOUTER UN OBJET ADDED QUI CORRESPOND AUX FICHIERS TRACKES DONT LE STAGE EST ENCORE NULL

        const updates: any[] = []

        return new Promise(async (resolve, reject): Promise<any> => {
            files = await this._ls()

            const readStream  = this.db.createReadStream()

            const writeStream = new stream.Writable({
                objectMode: true,
                write: async (file, encoding, next) => {
                    // if (file.value.tracked) { // file is tracked
                        if (file.value.tracked && file.snapshot === 'null') { unsnapshot.push(file.key) }



                        if (files[file.key]) { // file still exists in wdir
                            if (new Date(file.value.mtime) < files[file.key].mtime) { // file has been modified since last index's update

                                const cid = await this.cid(file.key)

                                index[file.key] = {
                                    mtime: files[file.key].mtime.toISOString(),
                                    tracked: file.value.tracked,
                                    wdir: cid,
                                    snapshot: file.value.snapshot
                                }

                                updates.push({ type: 'put', key: file.key, value: index[file.key] })


                                // if (file.value.tracked) {
                                //     console.log('Modified: ' + file.key)
                                //     modified.push(file.key) // ONLY IF WDIR / STAGE
                                // }


                            } else {
                                index[file.key] = file.value
                            }

                            if(file.value.tracked && index[file.key].wdir !== index[file.key].snapshot) {
                                modified.push(file.key)
                            }
                            if (!file.value.tracked) { untracked.push(file.key) }

                        } else { // file does not exist in wdir anymore
                            if (file.value.snapshot === 'null') {
                                delete index[file.key]
                                updates.push({ type: 'del', key: file.key })
                            } else {
                                index[file.key] = {
                                    mtime: new Date(Date.now()).toISOString(),
                                    tracked: file.value.tracked,
                                    wdir: 'null',
                                    snapshot: file.value.snapshot

                                }
                                updates.push({ type: 'put', key: file.key, value: index[file.key] })
                                if (!file.value.tracked) { untracked.push(file.key) }

                            }

                            if (file.value.tracked && file.value.snapshot !== 'null') { deleted.push(file.key) }
                        }

                    // } else { // file is untracked
                        // untracked.push(file.key)

                    // }

                    delete files[file.key]
                    next();


                }
            });

            writeStream
                .on('finish', async () => {
                    for (const path in files) { // file has been added since last index's update
                        const cid = await this.cid(path)

                        index[path] = {
                            mtime: files[path].mtime.toISOString(),
                            tracked: false,
                            wdir: cid,
                            snapshot: 'null'
                        }

                        updates.push({ type: 'put', key: path, value: index[path] })
                        untracked.push(path)
                    }

                    await this.db.batch(updates)

                    resolve({ index, untracked, unsnapshot, modified, deleted })
                })
                .on('error', err => {
                    reject(err)
                })

            readStream
                .pipe(writeStream)
                .on('error', err => {
                    reject(err)
                })
        })
    }

    public async cid(path: string): Promise<string> {
        const data   = [{ path: path, content: fs.readFileSync(npath.join(this.repository.paths.root, path)) }]
        const result = await this.node.files.add(data, { onlyHash: true })

        return result[0].hash
    }

    public async snapshot(opts?: any): Promise<any> {
        const { index, untracked, modified, deleted } = await this.status()

        const promises: any[] = []
        const updates:  any[] = []


        for (let path of modified) {
            index[path].snapshot = index[path].wdir
            updates.push({ type: 'put', key: path, value: index[path] })
            promises.push(this.node.files.write('/' + path, fs.readFileSync(npath.join(this.repository.paths.root, path)), { create: true, parents: true }))
        }

        promises.push(this.db.batch(updates))

        await Promise.all(promises)

        const hash = (await this.node.files.stat('/', { hash: true })).hash


        return hash
    }

    private async clean(path: string): Promise<void> {
        let dir = npath.dirname(path)

        while (dir !== '.') {
            const stat = await this.node.files.stat('/' + dir)

            if(stat.type === 'directory' && stat.blocks === 0) {
                await this.node.files.rm('/' + dir, { recursive: true })
            } else {
                break
            }

            dir = npath.dirname(dir)
        }
    }

    private extract(paths: string[], index: any): string[] {
        let extracted = paths.map(path => {
            path = npath.relative(this.repository.paths.root, path)
            return _.filter(Object.keys(index), entry => {
                return entry.indexOf(path) === 0
            })
        })
        return _.uniq(_.flattenDeep(extracted))
    }
}
