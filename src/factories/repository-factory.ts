import Pando from '@pando'
import Repository from '@components/repository'

export default class RepositoryFactory {
  
  public pando: Pando
  
  public constructor (_pando) {
    this.pando = _pando
  }
  
  public async load (_path: string = '.'): Promise < Repository > {
    if(Repository.exists(_path)) {
      let repository = new Repository(this.pando, _path)
      await repository.loadIPFS()
      return repository
    } else {
      throw new Error('No pando repository exists at: ' + _path)
    }
  }
  
  public async create (_path: string = '.', opts?: any): Promise < Repository > {
    let repository = new Repository(this.pando, _path)
    await repository.initialize()
    return repository
  }

  public async clone (address: string) {
    
  }
  
}