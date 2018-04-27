import Web3 from 'web3'

export const get = (opts) => {
  let web3: any
  if (opts.gateway) {
    web3 = new Web3(new Web3.providers.HttpProvider(opts.gateway))
    
    if (typeof web3.currentProvider.sendAsync !== "function") {
      web3.currentProvider.sendAsync = function() {
        return web3.currentProvider.send.apply(web3.currentProvider, arguments)
      }
    }
    
  } else {
    // Handle the case for Mist/Metamask in browser web3 injection
    // See gnosis.js Gnosis.setWeb3Provider() method for inspiration
  }  
  return web3
}