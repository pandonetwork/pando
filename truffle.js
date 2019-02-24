module.exports = {
  networks: {
    devnet: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 50e6,
      gasPrice: 1500000000
    }
  },
  compilers: {
    solc: {
      version: "0.4.24"
    }
  }
}
