export interface IAuthor {
  account: string
}

export interface IEthereum {
  gateway?: string
  networkId?: string
}

export interface IConfiguration {
  author: IAuthor
  ethereum: IEthereum
}
