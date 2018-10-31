import fs from 'fs-extra'
import IPFS from 'ipfs'
import Level from 'level'
import npath from 'path'
import FiberFactory from './fibers'

// import Index from '@pando/index'


export default class Repository {
    public static paths = {
        root: '.',
        pando: '.pando',
        ipfs: '.pando/ipfs',
        index: '.pando/index',
        db: '.pando/db',
        current: '.pando/current',
        config: '.pando/config',
        branches: '.pando/branches',
        remotes: '.pando/remotes'
    }


    public static async create(path: string = '.'): Promise<Repository> {
        return new Promise<Repository>((resolve, reject) => {
            let node = new IPFS({ repo: npath.join(path, Repository.paths.ipfs), start: false })

            node.on('ready', () => {
                resolve(new Repository(path, node))
            })

            node.on('error', (error) => {
                reject(error)
            })
        })
    }

    // public static async create(path: string = '.'): Promise<Repository> {
    //
    //
    //     const repository = new Repository(path)
    //
    //     fs.ensureDirSync(repository.paths.pando)
    //
    //
    //     return repository
    // }


    public paths = { ...Repository.paths }
    public node: IPFS
    public fibers: FiberFactory
    // public index: Index

    public constructor(path: string = '.', node: IPFS) {
        for (const p in this.paths) {
            if (this.paths.hasOwnProperty(p)) {
                this.paths[p] = npath.join(path, this.paths[p])
            }
        }
        this.node = node
        this.fibers = new FiberFactory(this)

    }

    public async remove() {
        // fs.removeSync(this.paths.pando)
        fs.removeSync(this.paths.pando)
    }
}
