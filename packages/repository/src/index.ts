import fs from 'fs-extra'
import IPFS from 'ipfs'
import Level from 'level'
import npath from 'path'


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


        const repository = new Repository(path)

        fs.ensureDirSync(repository.paths.pando)


        return repository
    }

    public paths = { ...Repository.paths }

    public constructor(path: string = '.') {
        for (const p in this.paths) {
            if (this.paths.hasOwnProperty(p)) {
                this.paths[p] = npath.join(path, this.paths[p])
            }
        }
    }

    public async remove() {
        // fs.removeSync(this.paths.pando)
        fs.removeSync(this.paths.pando)
    }
}
