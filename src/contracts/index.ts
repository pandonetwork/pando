import contractor from 'truffle-contract'

export const artifacts = {
  kernel: require('@aragon/os/build/contracts/Kernel.json'),
  daoFactory: require('@aragon/os/build/contracts/DAOFactory.json'),
  acl: require('@aragon/os/build/contracts/ACL.json'),
  appProxyUpgradeable: require('@aragon/os/build/contracts/AppProxyUpgradeable.json'),
  pando: require('@build/contracts/Pando.json')
}

export const kernel = contractor(artifacts.kernel)
export const daoFactory = contractor(artifacts.daoFactory)
export const acl = contractor(artifacts.acl)
export const pando = contractor(artifacts.pando)
export const appProxyUpgradeable = contractor(artifacts.appProxyUpgradeable)

export const initialize = (web3: any, account: string) => {
  let contracts = {}
  for (let artifact in artifacts) {
    contracts[artifact] = contractor(artifacts[artifact])
    contracts[artifact].setProvider(web3.currentProvider)
    contracts[artifact].defaults({ from: account, gas: 100000000 })
  }
  return contracts
}