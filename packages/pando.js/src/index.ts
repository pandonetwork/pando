import _ from 'lodash'
import TruffleContract from 'truffle-contract'
import Web3 from 'web3'
import PlantFactory from './plant/factory'
// import OrganizationFactory from './organization/factory'
import PandoError from './error'
// import {PWebsocketProvider } from 'web3/providers'
import {
  IPandoOptions,
  PandoOptions,
  APMOptions,
  Gateway,
  PWebsocketProvider } from '@pando/types'


const _artifacts = [
  'Kernel',
  'ACL',
  'Colony',
  'DemocracyScheme',
  'Organism',
  'Lineage',
  'Genesis',
  'OrganizationFactory'
].map((name) => {
  switch (name) {
    case 'Kernel' || 'ACL':
      return require(`@aragon/os/build/contracts/${name}.json`)
    case 'OrganizationFactory':
      return require(`@pando/factory/build/contracts/${name}.json`)
    case 'Colony':
      return require(`@pando/colony/build/contracts/${name}.json`)
    case 'DemocracyScheme':
      return require(`@pando/scheme-democracy/build/contracts/DemocracyScheme.json`)
    default:
      return require(`@pando/organism/build/contracts/${name}.json`)
  }
})

const _providerFromGateway = (gateway: Gateway): PWebsocketProvider => {
  switch (gateway.protocol) {
    case 'ws':
      return new Web3.providers.WebsocketProvider('ws://' + gateway.host + ':' + gateway.port) as PWebsocketProvider
    case 'http':
      throw new PandoError('E_DEPRECATED_PROVIDER_PROTOCOL', gateway.protocol)
    default:
      throw new PandoError('E_UNKNOWN_PROVIDER_PROTOCOL', gateway.protocol)
  }
}

const _defaults = (options: IPandoOptions): PandoOptions => {
  const apm      = _.defaultsDeep(options.apm, { ens: '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1' })
  const gateway  = _.defaultsDeep(options.ethereum.gateway, { protocol: 'ws', host: 'localhost', port: '8545' })
  const provider = typeof options.ethereum.provider !== 'undefined'? options.ethereum.provider : _providerFromGateway(gateway)

  return { ethereum: { account: options.ethereum.account, provider }, apm }
}


export default class Pando {
  public options: PandoOptions
  public plants: PlantFactory
  // public organizations: OrganizationFactory
  public contracts: any

  public static async create(options: IPandoOptions): Promise<Pando> {
    const pando = new Pando(_defaults(options))
    await pando._initialize()

    return pando
  }

  constructor(options: PandoOptions) {
    this.options = options
    this.plants = new PlantFactory(this)
    // this.organizations = new OrganizationFactory(this)
    this.contracts = Object.assign({}, ..._artifacts.map((artifact) => { return TruffleContract(artifact) } ).map(contract => ({ [contract._json.contractName]: contract })))
  }

  public async close(): Promise<void> {
    // console.log(this.options.ethereum.provider)
    this.options.ethereum.provider.connection.close()
  }

  private async _initialize(): Promise<Pando> {
    for (let contract in this.contracts) {
      this.contracts[contract].setProvider(this.options.ethereum.provider)
      this.contracts[contract].defaults({ from: this.options.ethereum.account, gas: 30e6, gasPrice: 15000000001 })
    }

    return this
  }
}
