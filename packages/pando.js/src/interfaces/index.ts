export interface IAuthor {
  account: string
}

export interface IEthereum {
  gateway?: string
  networkId?: string
  mnemonic?: string
}

export interface IIPFS {
  gateway?: string
}

export interface IConfiguration {
  author: IAuthor
  ethereum: IEthereum
  ipfs: IIPFS
}
