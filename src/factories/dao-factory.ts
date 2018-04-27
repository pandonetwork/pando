import Pando0x from '@pando0x'
import DAO from '@components/dao'

export default class DAOFactory {
    
  public pando0x: Pando0x
  
  public constructor (_pando0x: Pando0x) {
    this.pando0x = _pando0x
  }
  
  public async at (): Promise < DAO > {
    return new Promise < DAO > ((resolve, reject) => {
      
    })
  }
  
  public async create (): Promise < DAO > {
    return new Promise < DAO > (async (resolve, reject) => {
      try {
        let dao: DAO = await DAO.deploy(this.pando0x)
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