import _               from 'lodash'
import TruffleContract from 'truffle-contract'
import Web3            from 'web3'
import OrganismFactory from './organism/factory'

import { Provider }              from 'web3/providers'
import { PandoOptions, Gateway } from '@pando/types'

const _artifacts = [
    'PandoAPI',
    'Pando',
    'PandoLineage',
    'PandoGenesis',
].map((name) => require(`@pando/core/build/contracts/${name}.json`))

const _defaults  = (options: PandoOptions): PandoOptions => {
    if (typeof options.ethereum.provider !== 'undefined') {
        return options
    } else {
        options.ethereum.gateway = _.defaultsDeep(options.ethereum.gateway, { protocol: 'http', host: 'localhost', port: '8545' })

        switch (options.ethereum.gateway!.protocol) {
            case 'ws':
                options.ethereum.provider = new Web3.providers.WebsocketProvider('ws://' + options.ethereum.gateway!.host + ':' + options.ethereum.gateway!.port)
                break
            case 'http':
                options.ethereum.provider = new Web3.providers.HttpProvider('http://' + options.ethereum.gateway!.host + ':' + options.ethereum.gateway!.port)
                break
            default:
                throw new Error('Unknow provider type')
        }
    }

    return options
}


export default class Pando {
    public account:   string
    public provider:  Provider
    public contracts: any

    public organisms: OrganismFactory

    public static async create(options: PandoOptions): Promise<Pando> {
        const pando = new Pando(_defaults(options))
        await pando._initialize()

        return pando
    }

    constructor(options: PandoOptions) {
        this.account   = options.ethereum.account
        this.provider  = options.ethereum.provider!
        this.contracts = Object.assign({}, ..._artifacts.map((artifact) => { return TruffleContract(artifact) } ).map(contract => ({ [contract._json.contractName]: contract })))
        this.organisms = new OrganismFactory(this)
    }

    private async _initialize(): Promise<Pando> {
        for (let contract in this.contracts) {
            this.contracts[contract].setProvider(this.provider)
            this.contracts[contract].defaults({ from: this.account })
        }

        return this
    }



}
