import * as PandoContracts from '@contracts'
import * as PandoUtils from '@utils'

import DAOFactory from '@factories/dao-factory.ts'
import RepositoryFactory from '@factories/repository-factory.ts'

import { IConfiguration } from '@interfaces'


export default class Pando {
  
  public static contracts = PandoContracts
  public static utils = PandoUtils
   
  public web3: any
  public configuration: IConfiguration
  
  public repository = new RepositoryFactory(this)
  public dao = new DAOFactory(this)
  
  public contracts: any
  
  constructor (configuration: IConfiguration) {
    this.configuration = configuration
    this.web3 = Pando.utils.web3.get(configuration.ethereum)
    this.contracts = Pando.contracts.initialize(this.web3, configuration.user.account)
  }
}