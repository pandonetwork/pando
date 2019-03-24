// OK
export interface IPandoOptions {
  ethereum: IEthereumOptions
}

// OK
export interface IEthereumOptions {
  account: string
  gateway: string
  network?: string
}

// OK
export interface PandoOptions {
  ethereum: EthereumOptions
  apm: APMOptions
}

// OK
export interface EthereumOptions {
  account: string
  network: string
  provider: any
}

// OK
export interface APMOptions {
  ens: string
}
