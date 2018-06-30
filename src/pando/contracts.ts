import contractor from 'truffle-contract'

export const artifacts = {
  acl: require('@aragon/os/build/contracts/ACL.json'),
  appProxyFactory: require('@aragon/os/build/contracts/AppProxyFactory.json'),
  appProxyUpgradeable: require('@aragon/os/build/contracts/AppProxyUpgradeable.json'),
  daoFactory: require('@aragon/os/build/contracts/DAOFactory.json'),
  kernel: require('@aragon/os/build/contracts/Kernel.json'),
  tree: require('@ryhope/pando-core/build/contracts/Tree.json')
}

export const acl = contractor(artifacts.acl)
export const appProxyFactory = contractor(artifacts.appProxyFactory)
export const appProxyUpgradeable = contractor(artifacts.appProxyUpgradeable)
export const daoFactory = contractor(artifacts.daoFactory)
export const kernel = contractor(artifacts.kernel)
export const tree = contractor(artifacts.tree)

export const initialize = (web3: any, account: string) => {
  const contracts = {}
  for (const artifact in artifacts) {
    if (artifacts.hasOwnProperty(artifact)) {
      contracts[artifact] = contractor(artifacts[artifact])
      contracts[artifact].setProvider(web3.currentProvider)
      contracts[artifact].defaults({ from: account, gas: 100000000 })
    }
  }
  return contracts
}
