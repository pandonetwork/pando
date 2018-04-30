import Pando from '@pando'
import Repository from '@components/repository'

export default class RepositoryFactory {
  
  public pando: Pando
  
  public constructor (_pando) {
    this.pando = _pando
  }
  
  public async load (_path: string = '.'): Promise < Repository > {
    return new Promise < Repository > (async (resolve, reject) => {
      try {
        if(Repository.exists(_path)) {
          let repository = new Repository(this.pando, _path)
          await repository.loadIPFS()
          resolve(repository)
        } else {
          throw new Error('No pando repository exists at: ' + _path)
        }
      } catch (err) {
        reject(err)
      }
    })
  }
  
  public async create (_path: string = '.'): Promise < Repository > {
    return new Promise < Repository > (async (resolve, reject) => {
      try {
        let repository = new Repository(this.pando, _path)
        await repository.initialize()
        resolve(repository)
      } catch (err) {
        reject(err)
      }
    })
  }

  public async clone (address: string) {
    
  }
  
}