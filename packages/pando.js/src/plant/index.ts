import fs           from 'fs-extra'
import npath        from 'path'
import IPFS         from 'ipfs'
import FiberFactory from './fiber/factory'
import PandoError   from '../error'


export default class Plant {
    public static paths = {
        root:  '.',
        pando: '.pando',
        ipfs:  '.pando/ipfs',
        index: '.pando/index',
        db:    '.pando/db',
        current: '.pando/current',
        config: '.pando/config',
        fibers: '.pando/fibers',
    }

    public paths:  any = {}
    public node:   IPFS
    public fibers: FiberFactory

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
