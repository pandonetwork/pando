import register from 'module-alias/register'

import Branch from '@components/branch'
import Index from '@components/index'
import Remote from '@components/remote'
import Repository from '@components/repository'
import RepositoryFactory from '@factories/repository-factory'
import { IConfiguration } from '@interfaces'
import File from '@objects/file'
import IPLDNode from '@objects/ipld-node'
import Snapshot from '@objects/snapshot'
import Tree from '@objects/tree'
import * as PandoContracts from '@root/contracts'
import * as PandoUtils from '@root/utils'
import * as utils from '@utils'
import npath from 'path'
import HDWalletProvider from 'truffle-hdwallet-provider'
import Web3 from 'web3'

// Web3.providers.HttpProvider.prototype.sendAsync =
//   Web3.providers.HttpProvider.prototype.send

export default class Pando {
  public static contracts = PandoContracts
  public static utils = PandoUtils

  public static create(configuration: IConfiguration): Pando {
    const pando = new Pando(configuration)
    return pando
  }

  public static load(path: string = '.'): Pando {
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
  public repositories = new RepositoryFactory(this)
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
