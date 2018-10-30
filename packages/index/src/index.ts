///<reference path="../node_modules/@types/levelup/index.d.ts"/>

import levelup from 'levelup'
import fs from 'fs-extra'
import IPFS from 'ipfs'
import Level from 'level'
import npath from 'path'
import Repository from '@pando/repository'
import klaw from 'klaw'
import through2 from 'through2'
import stream from 'stream'
import * as _ from 'lodash'

const ignore = through2.obj(function (item, enc, next) {
    // console.log(item.path)
    // console.log('IGNORE')
    if (!item.stats.isDirectory() && item.path.indexOf('.pando') < 0) {
        this.push(item)
    }
    next()
})


export default class Index {
    public static async create(repository: Repository): Promise<Index> {
        return new Promise<Index>((resolve, reject) => {
            const node = new IPFS({ repo: repository.paths.ipfs, start: false })
            node.on('ready', () => {
                Level(repository.paths.index, { valueEncoding: 'json' }, function (err, db) {
                    if (err) reject(err)

                    resolve(new Index(repository, node, db))
                })
            })
            node.on('error', (error) => {
                reject(error)
            })
        })
    }

    public repository: Repository
    public node: IPFS
    public index: Level


    constructor(repository: Repository, node: IPFS, db: any) {
        this.repository = repository
        this.node  = node
        this.index = db
    }


    // public ignore(item: string): boolean {
    //     console.log(item)
    //     if (item.indexOf('.pando') >= 0) {
    //         return false
    //     } else {
    //         return true
    //     }
    // }



    // const filter = item => {
    //     return item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0
    // }

    public async current(): Promise<any> {
        const index = {}

        return new Promise((resolve, reject): any => {
            const readStream  = this.index.createReadStream()

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
            let value = await this.index.get(path)

            value.tracked = true

            await this.index.put(path, value)
        }

    }

    public async untrack(paths: string[]): Promise<any> {
        let { index, untracked, modified, deleted } = await this.status()

        paths = this.extract(paths, index)

        for (let path of paths) {
            let value = await this.index.get(path)

            value.tracked = false

            await this.index.put(path, value)
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

            const readStream  = this.index.createReadStream()

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

                    await this.index.batch(updates)

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

    public async update(): Promise<any> {
        const files = {}
        const index = {}
        const untracked : string[] = []
        const modified: string[] = []
        const deleted: string[] = []

        const updates: any[] = []

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
                .on('end', () => {
                    const readStream  = this.index.createReadStream()

                    const writeStream = new stream.Writable({
                        objectMode: true,
                        write: async (file, encoding, next) => {
                            if (files[file.key]) { // file still exists in wdir
                                if (new Date(file.value.mtime) < files[file.key].mtime) { // file has been modified since last index's update

                                    const data = [{ path: file.key, content: fs.readFileSync(npath.join(this.repository.paths.root, file.key)) }]
                                    const result = await this.node.files.add(data, { onlyHash: true })
                                    const cid = result[0].hash

                                    index[file.key] = {
                                        mtime: files[file.key].mtime.toISOString(),
                                        snapshot: file.value.snapshot,
                                        stage: file.value.stage,
                                        wdir: cid
                                    }
                                    updates.push({ type: 'put', key: file.key, value: index[file.key] })

                                    if (index[file.key].stage !== 'null') {
                                        modified.push(file.key)
                                    } else {
                                        untracked.push(file.key)
                                    }

                                } else { // file has not been modified since last index's update
                                    index[file.key] = file.value

                                    if (index[file.key].stage === 'null') {
                                        untracked.push(file.key)
                                    }
                                }
                            } else { // file does not exist in wdir anymore
                                index[file.key] = {
                                    mtime: new Date(Date.now()).toISOString(),
                                    snapshot: file.value.snapshot,
                                    stage: file.value.stage,
                                    wdir: 'null'
                                }
                                updates.push({ type: 'put', key: file.key, value: index[file.key] })

                                deleted.push(file.key)
                            }
                            delete files[file.key]
                            next();
                        }
                    });

                    writeStream
                        .on('finish', async () => {
                            for (const path in files) { // file has been added since last index's update
                                if (files.hasOwnProperty(path)) {
                                    const data = [{ path: path, content: fs.readFileSync(npath.join(this.repository.paths.root, path)) }]
                                    const result = await this.node.files.add(data, { onlyHash: true })
                                    const cid = result[0].hash

                                    index[path] = {
                                        mtime: files[path].mtime.toISOString(),
                                        snapshot: 'null',
                                        stage: 'null',
                                        wdir: cid
                                    }

                                    updates.push({ type: 'put', key: path, value: index[path] })
                                    untracked.push(path)
                                }
                            }

                            await this.index.batch(updates)

                            resolve({ index, untracked, modified, deleted })
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
        })
    }

    public async cid(path: string): Promise<string> {
        const data   = [{ path: path, content: fs.readFileSync(npath.join(this.repository.paths.root, path)) }]
        const result = await this.node.files.add(data, { onlyHash: true })

        return result[0].hash
    }

    // public async snapshot(files: string[]): Promise<any> {
    //     // const files:any = {}
    //     const index = await this.update()
    //     const paths = this.extract(files, index)
    //     const updates: any[] = []
    //
    //     console.log(paths)
    //
    //     for (let path of paths) {
    //         const entry = await this.index.get(path)
    //
    //         if (entry.tracked && entry.wdir !== entry.snapshot) { // entry has been modified since last stage
    //             if (entry.wdir !== 'null') { // entry exists in wdir
    //                 await this.node.files.write('/' + path, fs.readFileSync(npath.join(this.repository.paths.root, path)), { create: true, parents: true })
    //             } else { // entry does not exists in wdir
    //                 await this.node.files.rm('/' + path)
    //                 await this.clean(path)
    //             }
    //
    //             index[path].stage = index[path].wdir
    //             updates.push({ type: 'put', key: path, value: index[path] })
    //         }
    //     }
    //
    //     await this.index.batch(updates)
    //
    //     return index
    // }

    public async snapshot(opts?: any): Promise<any> {
        const { index, untracked, modified, deleted } = await this.status()
        const promises: any[] = []
        const updates:  any[] = []


        for (let path of modified) {
            index[path].snapshot = index[path].wdir
            updates.push({ type: 'put', key: path, value: index[path] })
            promises.push(this.node.files.write('/' + path, fs.readFileSync(npath.join(this.repository.paths.root, path)), { create: true, parents: true }))
        }

        // for (let path in modified) {
        //     const entry = await this.index.get(path)
        //
        //     if (entry.tracked && entry.wdir !== entry.snapshot) { // entry has been modified since last stage
        //         if (entry.wdir !== 'null') { // entry exists in wdir
        //             await this.node.files.write('/' + path, fs.readFileSync(npath.join(this.repository.paths.root, path)), { create: true, parents: true })
        //         } else { // entry does not exists in wdir
        //             await this.node.files.rm('/' + path)
        //             await this.clean(path)
        //         }
        //
        //         index[path].stage = index[path].wdir
        //         updates.push({ type: 'put', key: path, value: index[path] })
        //     }
        // }
        promises.push(this.index.batch(updates))
        await Promise.all(promises)


        return index
    }


    public async stage(files: string[]): Promise<any> {
        // const files:any = {}
        const index = await this.update()
        const paths = this.extract(files, index)
        const updates: any[] = []

        console.log(paths)

        for (let path of paths) {
            const entry = await this.index.get(path)

            if (entry.wdir !== entry.stage) { // entry has been modified since last stage
                if (entry.wdir !== 'null') { // entry exists in wdir
                    await this.node.files.write('/' + path, fs.readFileSync(npath.join(this.repository.paths.root, path)), { create: true, parents: true })
                } else { // entry does not exists in wdir
                    await this.node.files.rm('/' + path)
                    await this.clean(path)
                }

                index[path].stage = index[path].wdir
                updates.push({ type: 'put', key: path, value: index[path] })
            }
        }

        await this.index.batch(updates)

        return index
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
        paths = paths.map(path => {
            path = npath.relative(this.repository.paths.root, path)
            return _.filter(Object.keys(index), entry => {
                return entry.indexOf(path) === 0
            })
        })
        return _.uniq(_.flattenDeep(paths))
    }
}
