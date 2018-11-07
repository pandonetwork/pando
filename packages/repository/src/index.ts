import fs from 'fs-extra'
import IPFS from 'ipfs'
import Level from 'level'
import npath from 'path'
import FiberFactory from './fiber/factory'

import util from 'util'

import async from 'async';

// import Index from '@pando/index'

const ensure = util.promisify(fs.ensureDir)


export default class Repository {
    public static paths = {
        root: '.',
        pando: '.pando',
        ipfs: '.pando/ipfs',
        index: '.pando/index',
        db: '.pando/db',
        current: '.pando/current',
        config: '.pando/config',
        fibers: '.pando/fibers',
    }


    public static async create(path: string = '.'): Promise<Repository> {
        return new Promise<Repository>(async (resolve, reject) => {

            // TODO: check that path exists

            await Promise.all([
                ensure(npath.join(path, '.pando', 'ipfs')),
                ensure(npath.join(path, '.pando', 'fibers'))
            ])

            const node = new IPFS({ repo: npath.join(path, '.pando', 'ipfs'), start: false })
                .on('error', err => {
                    reject(err)
                })
                .on('ready', async () => {
                    const repository = new Repository(path, node)
                    await repository.fibers.create('master', { fork: false })
                    await repository.fibers.switch('master', { stash: false })
                    resolve(repository)
                })
        })
    }

    public paths = { ...Repository.paths }
    public node: IPFS
    public fibers: FiberFactory
    // public index: Index

    public constructor(path: string = '.', node: IPFS) {
        this.paths['root']   = path
        this.paths['pando']  = npath.join(path, '.pando')
        this.paths['ipfs']   = npath.join(path, '.pando', 'ipfs')
        this.paths['fibers'] = npath.join(path, '.pando', 'fibers')

        this.node   = node
        this.fibers = new FiberFactory(this)
    }

    public async remove() {
        if (this.fibers.db.isOpen()) { await this.fibers.db.close() }

        fs.removeSync(this.paths.pando)
    }
}
