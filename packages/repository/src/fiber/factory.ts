import Repository from '../'

export default class FiberFactory {
    public repository: Repository

    constructor(repository: Repository) {
        this.repository = repository
    }
}
