import Repository from '../'
import Index      from './index/'
import uuidv1     from 'uuid/v1'
import npath from 'path'
import * as _ from 'lodash'
import fs from 'fs-extra'


export default class Fiber {

    public uuid: string
    public paths: any
    public repository: Repository
    public index: Index

    public static async create(repository: Repository): Promise<Fiber> {
        const uuid = uuidv1()
        fs.ensureDirSync(npath.join(repository.paths.fibers, uuid))

        return new Fiber(repository, uuid)
    }

    public constructor(repository: Repository, uuid: string) {
        this.repository = repository
        this.uuid       = uuid
        this.paths      = { root: npath.join(repository.paths.fibers, uuid), index: npath.join(repository.paths.fibers, uuid, 'index') }
        this.index      = new Index(this)
    }

    public async status(): Promise<any> {
        return this.index.status()
    }
}
