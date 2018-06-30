import Branch from '@components/branch'
import Index from '@components/index'
import Repository from '@components/loom'
import Remote from '@components/remote'
import RemoteBranch from '@components/remote-branch'
import RepositoryFactory from '@factories/loom-factory.ts'
import { IConfiguration } from '@interfaces'
import File from '@objects/file'
import IPLDNode from '@objects/ipld-node'
import Snapshot from '@objects/snapshot'
import Tree from '@objects/tree'
import * as PandoContracts from '@pando/contracts'
import * as PandoUtils from '@pando/utils'
import * as utils from '@utils'
import npath from 'path'

export default class Pando {
  public static contracts = PandoContracts
  public static utils = PandoUtils

  public static async create(configuration: IConfiguration): Promise<Pando> {
    const pando = new Pando(configuration)
    return pando
  }

  public static async load(path: string): Promise<Pando> {
    if (!Repository.exists(path)) {
      throw new Error('No repository found at ' + path)
    }
    const configuration = utils.yaml.read(
      npath.join(path, Repository.paths.config)
    )
    const pando = new Pando(configuration)
    return pando
  }

  public config: IConfiguration
  public contracts: any
  public repository = new RepositoryFactory(this)
  public web3: any

  constructor(config: IConfiguration) {
    this.config = config
    this.web3 = Pando.utils.web3.get(config.ethereum)
    this.contracts = Pando.contracts.initialize(
      this.web3,
      config.author.account
    )
  }
}

export { Snapshot, Tree, File, IPLDNode, Repository, Index, Branch, Remote }
