import DAOFactory          from '@factories/dao-factory.ts'
import LoomFactory         from '@factories/loom-factory.ts'
import * as PandoContracts from '@contracts'
import * as PandoUtils     from '@utils'
import { IConfiguration }  from '@interfaces'
import Snapshot            from '@objects/snapshot'
import Tree                from '@objects/tree'
import File                from '@objects/file'
import IPLDNode            from '@objects/ipld-node'
import Loom                from '@components/loom'
import Index               from '@components/index'
import Branch              from '@components/branch'


export default class Pando {  
  public static contracts = PandoContracts
  public static utils = PandoUtils
   
  public web3: any
  public configuration: IConfiguration
  
  public dao = new DAOFactory(this)
  public loom = new LoomFactory(this)
  
  public contracts: any
  
  constructor (configuration: IConfiguration) {
    this.configuration = configuration
    this.web3 = Pando.utils.web3.get(configuration.ethereum)
    this.contracts = Pando.contracts.initialize(this.web3, configuration.author.account)
  }
}

export { Snapshot, Tree, File, IPLDNode, Loom, Index, Branch }