import { Provider } from 'web3/providers'


export interface PandoOptions {
    ethereum: EthereumOptions
}

export interface EthereumOptions {
    account:   string
    gateway?:  Gateway
    provider?: Provider
}

export interface Gateway {
    protocol: 'ws' | 'http'
    host: string
    port: string
}
