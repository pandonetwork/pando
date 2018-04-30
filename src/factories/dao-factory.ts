import Pando from '@pando'
import DAO from '@components/dao'

export default class DAOFactory {
    
  public pando: Pando
  
  public constructor (_pando: Pando) {
    this.pando = _pando
  }
  
  public async at (): Promise < DAO > {
    return new Promise < DAO > ((resolve, reject) => {
      
    })
  }
  
  public async create (): Promise < DAO > {
    return new Promise < DAO > (async (resolve, reject) => {
      try {
        let dao: DAO = await DAO.deploy(this.pando)
        let receipt1 = await dao.grantAppManagerRole()
        let receipt2 = await dao.deployTree()
        resolve(dao)
      } catch (err) {
        reject(err)
      }
    })
  }
  
  public async fork (): Promise < DAO > {
    return new Promise < DAO > ((resolve, reject) => {
      
    })
  }

}