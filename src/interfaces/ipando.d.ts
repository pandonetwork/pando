export interface IUser {
  account: string
}

export interface IEthereum {
  gateway?: string
  networkId?: string
}

export interface IConfiguration {
  user: IUser
  ethereum: IEthereum
}

export interface IPaths {
  root: string
  pando: string
  ipfs: string
  conf: string
  index: string
  tmp: string
  head: string
  refs: string
}
