import Repository from '@pando/repository'
import Lineage    from '@pando/lineage'
import Index      from '@pando/index'


export default class Fiber {

    public repository: Repository
    // public lineage   : Lineage[] = Lineage[]
    public index: Index

    public static async create(): Promise<Fiber> {

    }

    public constructor(repository: Repository) {
        this.repository = repository
    }

    public async remove() {

    }
}
