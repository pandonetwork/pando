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

    public async update(): Promise<any> {
        const files = {}
        const index = {}
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
                                    console.log('Modified file: ' + file.key)

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
                                } else { // file has not been modified since last index's update
                                    console.log('Unmodified file: ' + file.key)
                                    index[file.key] = file.value
                                }
                            } else { // file does not exist in wdir anymore
                                console.log('Deleted file: ' + file.key)
                                index[file.key] = {
                                    mtime: new Date(Date.now()).toISOString(),
                                    snapshot: file.value.snapshot,
                                    stage: file.value.stage,
                                    wdir: 'null'
                                }
                                updates.push({ type: 'put', key: file.key, value: index[file.key] })
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
                                }
                            }

                            await this.index.batch(updates)

                            resolve(index)
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



                    // const dir = path.dirname('/foo/bar/baz/asdf/quux');
                    // empty directory
                }

                index[path].stage = index[path].wdir
                updates.push({ type: 'put', key: path, value: index[path] })
            }
        }

        await this.index.batch(updates)

        console.log('MFS')
        const ls = await this.node.files.ls()

        const hash = await this.node.files.stat('/', { hash: true })

        console.log(hash)

        return index

        // for (let path of files) {
        //     path = npath.relative(this.repository.paths.root, path)
        //
        //     // fs.stat(npath.join(this.repository.paths.root, path), (err, stats) => {
        //     //
        //     // }
        //     //
        //     // fs.access(npath.join(this.repository.paths.root, path), fs.constants.F_OK, (err) => {
        //     //     if(err) { // path does not exist in wdir
        //     //
        //     //     } else { // path exists in wdir
        //     //
        //     //     }
        //     // })
        // }


        // const readStream  = this.index.createReadStream()

        // const writeStream = new stream.Writable({
        //     objectMode: true,
        //     write: async (file, encoding, next) => {
        //
        //         if (file.)
        //
        //         if (files.indexOf(file.key)]) { // file still exists in wdir
        //             if (new Date(file.value.mtime) < files[file.key].mtime) { // file has been modified since last index's update
        //                 console.log('Modified file: ' + file.key)
        //
        //                 const data = [{ path: file.key, content: fs.readFileSync(npath.join(this.repository.paths.root, file.key)) }]
        //                 const result = await this.node.files.add(data, { onlyHash: true })
        //                 const cid = result[0].hash
        //
        //                 index[file.key] = {
        //                     mtime: files[file.key].mtime.toISOString(),
        //                     snapshot: file.value.snapshot,
        //                     stage: file.value.stage,
        //                     wdir: cid
        //                 }
        //                 updates.push({ type: 'put', key: file.key, value: index[file.key] })
        //             } else { // file has not been modified since last index's update
        //                 console.log('Unmodified file: ' + file.key)
        //                 index[file.key] = file.value
        //             }
        //         } else { // file does not exist in wdir anymore
        //             console.log('Deleted file: ' + file.key)
        //             index[file.key] = {
        //                 mtime: new Date(Date.now()).toISOString(),
        //                 snapshot: file.value.snapshot,
        //                 stage: file.value.stage,
        //                 wdir: 'null'
        //             }
        //             updates.push({ type: 'put', key: file.key, value: index[file.key] })
        //         }
        //         delete files[file.key]
        //         next();
        //     }
        // });
    }

    private extract(files: string[], index: any): string[] {
        files = files.map(path => {
            path = npath.relative(this.repository.paths.root, path)
            return _.filter(Object.keys(index), entry => {
                return entry.indexOf(path) === 0
            })
        })

        return _.uniq(_.flattenDeep(files))
    }

    // public async stage(filePaths: string[]): Promise<any> {
    //     const index = await this.update()
    //     for (let filePath of filePaths) {
    //         filePath = path.normalize(filePath)
    //         const relativePath = path.relative(this.repository.paths.root, filePath)
    //
    //         if (utils.fs.exists(filePath)) {
    //             if (fs.lstatSync(filePath).isDirectory()) {
    //                 const filter = item => {
    //                     return item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0
    //                 }
    //                 const listing = klaw(filePath, { nodir: true, filter })
    //                 for (const item of listing) {
    //                     const relativeItemPath = path.relative(this.repository.paths.root, item.path)
    //                     filePaths.push(relativeItemPath)
    //                 }
    //                 // Check if files have been deleted
    //                 const children = _.filter(Object.keys(index), entry => {
    //                     return entry.indexOf(relativePath) === 0
    //                 })
    //
    //                 if (children.length) {
    //                     for (const child of children) {
    //                         filePaths.push(child)
    //                     }
    //                 }
    //             } else {
    //                 const cid = await this.repository.node!.upload(filePath)
    //                 index[relativePath].stage = cid
    //             }
    //         } else {
    //             // file / dir does not exist in cwd
    //             if (index[relativePath]) {
    //                 // Old file to delete
    //                 index[relativePath].wdir = 'null'
    //                 index[relativePath].stage = 'todelete'
    //             } else {
    //                 const filter = item => {
    //                     return item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0
    //                 }
    //                 // Check if files have been deleted
    //                 const children = _.filter(Object.keys(index), entry => {
    //                     return entry.indexOf(relativePath) === 0
    //                 })
    //
    //                 if (children.length) {
    //                     for (const child of children) {
    //                         filePaths.push(child)
    //                     }
    //                 } else {
    //                     throw new Error(filePath + ' does not exist neither in current working directory nor in index')
    //                 }
    //             }
    //         }
    //     } // fin du for
    //
    //     this.current = index
    //     return index
    // }

}
