module.exports = {
  networks: {
    devnet: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    }
  },
  compilers: {
    solc: {
      version: "0.4.24"
    }
  }
}
