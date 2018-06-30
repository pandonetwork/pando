import Web3 from 'web3'

export const web3 = {
  get: opts => {
    let access
    if (opts.gateway) {
      access = new Web3(new Web3.providers.HttpProvider(opts.gateway))

      // if (typeof access.currentProvider.sendAsync !== 'function') {
      //   access.currentProvider.sendAsync = args => {
      //     return access.currentProvider.send.apply(access.currentProvider, args)
      //   }
      // }
    } else {
      // Handle the case for Mist/Metamask in browser web3 injection
      // See gnosis.js Gnosis.setWeb3Provider() method for inspiration
    }
    return access
  }
}
