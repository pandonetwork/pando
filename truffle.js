module.exports = {
  networks: {
    devnet: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 30e6,
      gasPrice: 15000000001
    }
  },
  compilers: {
    solc: {
      version: "0.4.24"
    }
  }
}
