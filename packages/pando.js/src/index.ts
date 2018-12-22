import _               from 'lodash'
import TruffleContract from 'truffle-contract'
import Web3            from 'web3'
import OrganismFactory     from './organism/factory'
import OrganizationFactory from './organization/factory'
import PlantFactory         from './plant/factory'
import PandoError from './error'

import { Provider } from 'web3/providers'
import {
  IPandoOptions,
  PandoOptions,
  APMOptions,
  Gateway } from '@pando/types'

const _artifacts = [
  'Kernel',
  'ACL',
  'Organism',
  'Lineage',
  'Genesis',
  'OrganizationFactory'
].map((name) => {
  if (name === 'Kernel' || name === 'ACL') {
    return require(`@aragon/os/build/contracts/${name}.json`)
  }
  else if (name === 'OrganizationFactory') {
    return require(`@pando/factory/build/contracts/${name}.json`)
  } else {
    return require(`@pando/organism/build/contracts/${name}.json`)
  }
})

const _providerFromGateway = (gateway: Gateway): Provider => {
  switch (gateway.protocol) {
    case 'ws':
      return new Web3.providers.WebsocketProvider('ws://' + gateway.host + ':' + gateway.port)
    case 'http':
      return new Web3.providers.HttpProvider('http://' + gateway.host + ':' + gateway.port)
    default:
      throw new PandoError('E_UNKNOWN_PROVIDER_PROTOCOL', gateway.protocol)
  }
}

const _defaults = (options: IPandoOptions): PandoOptions => {

  const apm      = _.defaultsDeep(options.apm, { ens: '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1' })
  const gateway  = _.defaultsDeep(options.ethereum.gateway, { protocol: 'http', host: 'localhost', port: '8545' })
  const provider = typeof options.ethereum.provider !== 'undefined'? options.ethereum.provider : _providerFromGateway(gateway)

  return { ethereum: { account: options.ethereum.account, provider }, apm }
}


export default class Pando {
  // public account:   string
  // public provider:  Provider
  // public apm: APMOptions
  public contracts: any
  public options: PandoOptions

  public organizations: OrganizationFactory
  public plants:        PlantFactory

  public static async create(options: IPandoOptions): Promise<Pando> {
      const pando = new Pando(_defaults(options))
      await pando._initialize()

      return pando
  }

  constructor(options: PandoOptions) {
      // this.account   = options.ethereum.account
      // this.provider  = options.ethereum.provider!
      // this.apm       = options.apm!
      this.options = options

      this.contracts     = Object.assign({}, ..._artifacts.map((artifact) => { return TruffleContract(artifact) } ).map(contract => ({ [contract._json.contractName]: contract })))
      this.organizations = new OrganizationFactory(this)
      this.plants        = new PlantFactory(this)

  }

  private async _initialize(): Promise<Pando> {
    for (let contract in this.contracts) {
      this.contracts[contract].setProvider(this.options.ethereum.provider)
      this.contracts[contract].defaults({ from: this.options.ethereum.account, gas: 30e6, gasPrice: 15000000001 })
    }

    return this
  }
}
