// OK
export interface IPandoOptions {
  ethereum: IEthereumOptions
  ipfs: IPFSOptions
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
  ipfs: IPFSOptions
  apm: APMOptions
}

// OK
export interface EthereumOptions {
  account: string
  network: string
  provider: any
}

// OK
export interface IPFSOptions {
  gateway: string
}

// OK
export interface APMOptions {
  ens: string
}
