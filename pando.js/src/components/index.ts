import CID from 'cids'
import fs from 'fs'
import klaw from 'klaw-sync'
import _ from 'lodash'
import path from 'path'
import * as utils from '../utils'
import Repository from './repository'
import IPFS from 'ipfs'
import level from 'level'
// import leveldown from 'leveldown'
// import sub from 'subleveldown'

const filter = item => {
    return item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0
}

export default class Index {
    public static async new(repository: Repository): Promise<Index> {
        const index = new Index(repository)
    }

    public static async load(repository: Repository): Promise<Index> {
        return new Index(repository)
    }

    public repository: Repository
    public db: any
    public ipfs: any

    //     var levelup = require('levelup')
    // var leveldown = require('leveldown')
    //
    // // 1) Create our store
    // var db = levelup(leveldown('./mydb'))

    public get path() {
        return this.repository.paths.index
    }

    public get current(): any {
        return utils.yaml.read(this.path)
    }

    public set current(index: any) {
        utils.yaml.write(this.path, index)
    }

    /**
     * Returns staged but unsnapshot files
     *
     * @returns {string[]}
     */
    public get unsnapshot(): string[] {
        const current = this.current
        const unsnaphot: any[] = []

        for (const entry in current) {
            if (current[entry].repo !== current[entry].stage) {
                unsnaphot.push(entry)
            }
        }

        return unsnaphot
    }

    public get untracked(): string[] {
        const current = this.current
        const untracked: any[] = []

        for (const entry in current) {
            if (current[entry].stage === 'null') {
                untracked.push(entry)
            }
        }

        return untracked
    }

    /**
     * Returns once staged files
     *
     * @returns {string[]}
     */
    public get staged(): string[] {
        const current = this.current
        const staged: any[] = []

        for (const entry in current) {
            if (current[entry].stage !== 'null') {
                staged.push(entry)
            }
        }

        return staged
    }

    /**
     * Returns modified once staged files
     *
     * @returns {string[]}
     */
    public get modified(): string[] {
        const current = this.current
        const modified: any[] = []

        for (const entry in current) {
            if (current[entry].stage !== 'null' && current[entry].stage !== 'todelete' && current[entry].wdir !== current[entry].stage) {
                modified.push(entry)
            }
        }

        return modified
    }

    constructor(repository: Repository) {
        this.repository = repository
        this.db = level(this.repository.paths.db, { valueEncoding: 'json' })
        // public stage: any
        // public specimen: any
        // var db = levelup(leveldown('./mydb'))
    }

    public async reinitialize(tree: any, index?: any): Promise<any> {
        index = index || {}

        delete tree['@type']
        delete tree.path

        for (const entry in tree) {
            if (tree.hasOwnProperty(entry)) {
                const node = await this.repository.node!.get(tree[entry]['/'])
                if (node['@type'] === 'tree') {
                    await this.reinitialize(node, index)
                } else if (node['@type'] === 'file') {
                    const cid = new CID(node.link['/']).toBaseEncodedString()
                    index[node.path] = {
                        mtime: new Date(Date.now()),
                        repo: cid,
                        stage: cid,
                        wdir: cid
                    }
                }
            }
        }

        this.current = index

        return index
    }

    public async updateLevel(): Promise<any> {
        // const self = this
        // const index = this.current
        const index: any = {}
        const files: any = {}
        const updates: any[] = []
        // const filter = item => {
        //     return item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0
        // }

        klaw(this.repository.paths.root, { nodir: true, filter }).forEach(file => {
            files[path.relative(this.repository.paths.root, file.path)] = { mtime: file.stats.mtime }
        })

        // console.log(listing)
        console.log(files)

        return new Promise((resolve, reject) => {
            this.db
                .createReadStream()
                .on('data', async file => {
                    if (files[file.key]) {
                        /* file still exists in wdir */
                        if (new Date(file.value.mtime) <= new Date(files[file.key].mtime)) {
                            /* file has been modified since last update */
                            index[file.key] = {
                                ...file.value,
                                wdir: await this.repository.node!.cid(path.join(this.repository.paths.root, file.key), { file: true })
                            }
                            file.value.wdir = await this.repository.node!.cid(path.join(this.repository.paths.root, file.key), { file: true })
                            updates.push({ type: 'put', key: file.key, value: index[file.key] })
                        } else {
                            index[file.key] = file.value
                        }
                    } else {
                        /* file does not exist in wdir anymore */
                        file.value.mtime = new Date(Date.now())
                        file.value.wdir = 'null'
                        updates.push({ type: 'put', key: file.key, value: file.value })
                    }
                    /* delete from the remaining files list */
                    delete files[file.key]
                })
                .on('error', function(err) {
                    console.log('Oh my!', err)
                })
                .on('close', function() {
                    console.log('Stream closed')
                })
                .on('end', async () => {
                    console.log('Stream ended')
                    for (const file in files) {
                        if (files.hasOwnProperty(file)) {
                            /* file has been added since last update */
                            const cid = await this.repository.node!.cid(path.join(this.repository.paths.root, file), { file: true })
                            // const value = {
                            //     mtime: files[remains].mtime,
                            //     repo: 'null',
                            //     stage: 'null',
                            //     wdir: cid
                            // }
                            index[file] = {
                                mtime: files[file].mtime,
                                repo: 'null',
                                stage: 'null',
                                wdir: cid
                            }
                            updates.push({ type: 'put', key: file, value: index[file] })
                        }
                    }
                    await this.db.batch(updates)
                    resolve(index)

                    this.db.createReadStream().on('data', file => {
                        console.log(file.key, '=', file.value)
                    })
                })
        })

        // for (const relativePath in index) {
        //     if (index.hasOwnProperty(relativePath)) {
        //         if (files[relativePath]) {
        //             // files at _path still exists
        //             if (new Date(index[relativePath].mtime) <= new Date(files[relativePath].mtime)) {
        //                 // files at _path has been modified
        //                 const cid = await this.repository.node!.cid(path.join(this.repository.paths.root, relativePath), { file: true })
        //                 index[relativePath].mtime = files[relativePath].mtime
        //                 index[relativePath].wdir = cid
        //             }
        //         } else {
        //             // files at _path has been deleted
        //             index[relativePath].mtime = new Date(Date.now())
        //             index[relativePath].wdir = 'null'
        //         }
        //         delete newFiles[relativePath]
        //     }
        // }
        //
        // for (const relativePath in newFiles) {
        //     if (newFiles.hasOwnProperty(relativePath)) {
        //         // file at _path has been added
        //         const cid = await this.repository.node!.cid(path.join(this.repository.paths.root, relativePath), { file: true })
        //         index[relativePath] = {
        //             mtime: files[relativePath].mtime,
        //             repo: 'null',
        //             stage: 'null',
        //             wdir: cid
        //         }
        //     }
        // }
    }

    public async update(): Promise<any> {
        const index = this.current
        const files = {}

        const listing = klaw(this.repository.paths.root, {
            nodir: true,
            filter
        })

        for (const item of listing) {
            const relativePath = path.relative(this.repository.paths.root, item.path)
            files[relativePath] = { mtime: new Date(item.stats.mtime) }
        }

        const newFiles: any = Object.assign(files)

        for (const relativePath in index) {
            if (index.hasOwnProperty(relativePath)) {
                if (files[relativePath]) {
                    // files at _path still exists
                    if (new Date(index[relativePath].mtime) <= new Date(files[relativePath].mtime)) {
                        // files at _path has been modified
                        const cid = await this.repository.node!.cid(path.join(this.repository.paths.root, relativePath), { file: true })
                        index[relativePath].mtime = files[relativePath].mtime
                        index[relativePath].wdir = cid
                    }
                } else {
                    // files at _path has been deleted
                    index[relativePath].mtime = new Date(Date.now())
                    index[relativePath].wdir = 'null'
                }
                delete newFiles[relativePath]
            }
        }

        for (const relativePath in newFiles) {
            if (newFiles.hasOwnProperty(relativePath)) {
                // file at _path has been added
                const cid = await this.repository.node!.cid(path.join(this.repository.paths.root, relativePath), { file: true })
                index[relativePath] = {
                    mtime: files[relativePath].mtime,
                    repo: 'null',
                    stage: 'null',
                    wdir: cid
                }
            }
        }

        // for (let _path in index) { // remove deleted files from index
        //   if (index[_path].wdir === 'null') {
        //
        //   }
        // }

        this.current = index

        return index
    }

    public async stageLevel(filePaths: string[]): Promise<any> {
        const index = await this.updateLevel()
        for (let filePath of filePaths) {
            filePath = path.normalize(filePath)
            const relativePath = path.relative(this.repository.paths.root, filePath)

            if (utils.fs.exists(filePath)) {
                if (fs.lstatSync(filePath).isDirectory()) {
                    const listing = klaw(filePath, { nodir: true, filter })
                    for (const item of listing) {
                        const relativeItemPath = path.relative(this.repository.paths.root, item.path)
                        filePaths.push(relativeItemPath)
                    }
                    // Check if files have been deleted
                    const children = _.filter(Object.keys(index), entry => {
                        return entry.indexOf(relativePath) === 0
                    })

                    if (children.length) {
                        for (const child of children) {
                            filePaths.push(child)
                        }
                    }
                } else {
                    const cid = await this.repository.node!.upload(filePath)
                    index[relativePath].stage = cid
                }
            } else {
                // file / dir does not exist in cwd
                if (index[relativePath]) {
                    // Old file to delete
                    index[relativePath].wdir = 'null'
                    index[relativePath].stage = 'todelete'
                } else {
                    const filter = item => {
                        return item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0
                    }
                    // Check if files have been deleted
                    const children = _.filter(Object.keys(index), entry => {
                        return entry.indexOf(relativePath) === 0
                    })

                    if (children.length) {
                        for (const child of children) {
                            filePaths.push(child)
                        }
                    } else {
                        throw new Error(filePath + ' does not exist neither in current working directory nor in index')
                    }
                }
            }
        } // fin du for

        this.current = index
        return index
    }

    public async stage(filePaths: string[]): Promise<any> {
        const index = await this.update()
        for (let filePath of filePaths) {
            filePath = path.normalize(filePath)
            const relativePath = path.relative(this.repository.paths.root, filePath)

            if (utils.fs.exists(filePath)) {
                if (fs.lstatSync(filePath).isDirectory()) {
                    const filter = item => {
                        return item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0
                    }
                    const listing = klaw(filePath, { nodir: true, filter })
                    for (const item of listing) {
                        const relativeItemPath = path.relative(this.repository.paths.root, item.path)
                        filePaths.push(relativeItemPath)
                    }
                    // Check if files have been deleted
                    const children = _.filter(Object.keys(index), entry => {
                        return entry.indexOf(relativePath) === 0
                    })

                    if (children.length) {
                        for (const child of children) {
                            filePaths.push(child)
                        }
                    }
                } else {
                    const cid = await this.repository.node!.upload(filePath)
                    index[relativePath].stage = cid
                }
            } else {
                // file / dir does not exist in cwd
                if (index[relativePath]) {
                    // Old file to delete
                    index[relativePath].wdir = 'null'
                    index[relativePath].stage = 'todelete'
                } else {
                    const filter = item => {
                        return item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0
                    }
                    // Check if files have been deleted
                    const children = _.filter(Object.keys(index), entry => {
                        return entry.indexOf(relativePath) === 0
                    })

                    if (children.length) {
                        for (const child of children) {
                            filePaths.push(child)
                        }
                    } else {
                        throw new Error(filePath + ' does not exist neither in current working directory nor in index')
                    }
                }
            }
        } // fin du for

        this.current = index
        return index
    }
}
