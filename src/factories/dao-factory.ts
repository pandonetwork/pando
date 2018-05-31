import Pando from '@pando'
import DAO from '@components/dao'

export default class DAOFactory {
    
  public pando: Pando
  
  public constructor (_pando: Pando) {
    this.pando = _pando
  }
  
  // public async at (): Promise < DAO > {
  // 
  // }
  
  public async create (): Promise < DAO > {
    let dao: DAO = await DAO.deploy(this.pando)
    let receipt1 = await dao.grantAppManagerRole()
    let receipt2 = await dao.deployTree()
    return dao 
  }
  
  // public async fork (): Promise < DAO > {
  //   return new Promise < DAO > ((resolve, reject) => {
  // 
  //   })
  // }

}