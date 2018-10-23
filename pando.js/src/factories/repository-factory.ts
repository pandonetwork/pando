import npath from 'path'
import Branch from '../components/branch'
import Index from '../components/index'
import Node from '../components/node'
import Repository from '../components/repository'
import Pando from '../pando'
import * as utils from '../utils'

export default class RepositoryFactory {
  public pando: Pando

  public constructor(pando: Pando) {
    this.pando = pando
  }

  public async create(path: string = '.'): Promise<Repository> {
    if (this.exists(path)) {
      throw new Error('A repository already exists at ' + path)
    }
    const repository = new Repository(this.pando, path)
    // Initialize .pando directory
    utils.fs.mkdir(repository.paths.pando)
    utils.fs.mkdir(repository.paths.ipfs)
    utils.fs.mkdir(repository.paths.branches)
    utils.fs.mkdir(repository.paths.remotes)
    utils.yaml.write(repository.paths.index, {})
    utils.yaml.write(repository.paths.config, this.pando.config)
    // Initialize master branch
    repository.branches.create('master')
    utils.yaml.write(repository.paths.current, 'master')
    // Initialize node and index
    repository.node = await Node.create(repository)
    repository.index = await Index.new(repository)

    return repository
  }

  public async load(path: string = '.'): Promise<Repository> {
    if (!this.exists(path)) {
      throw new Error('No repository found at ' + path)
    }

    const configuration = utils.yaml.read(
      npath.join(path, Repository.paths.config)
    )

    const pando = new Pando(configuration)

    const repository = new Repository(pando, path)
    repository.node = await Node.load(repository)
    repository.index = await Index.load(repository)

    return repository
  }

  public async clone(address: string, path: string = '.'): Promise<Repository> {
    const repository = await this.create(path)
    const remote = await repository.remotes.add('origin', address)
    await repository.pull('origin', 'master')

    return repository
  }

  public exists(path: string = '.'): boolean {
    return Repository.exists(path)
  }
}
