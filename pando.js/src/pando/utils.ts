import HDWalletProvider from 'truffle-hdwallet-provider'
import Web3 from 'web3'

Web3.providers.HttpProvider.prototype.sendAsync =
  Web3.providers.HttpProvider.prototype.send

export const web3 = {
  get: opts => {
    if (opts.gateway) {
      if (opts.mnemonic) {
        const provider = new HDWalletProvider(opts.mnemonic, opts.gateway)
        return new Web3(provider)
      } else {
        return new Web3(new Web3.providers.HttpProvider(opts.gateway))
      }
    } else {
      throw new Error('Please specify a web3 provider')
      // Handle the case for Mist/Metamask in browser web3 injection
      // See gnosis.js Gnosis.setWeb3Provider() method for inspiration
    }
  }
}
