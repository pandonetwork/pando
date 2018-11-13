module.exports = {
  networks: {
    rpc: {
      host: 'localhost',
      port: 8545,
      network_id: 15,
      // gas: 6.9e6
      gas: 0xffffffffff,
      gasPrice: 0x01
    },
    coverage: {
      host: 'localhost',
      port: 8555,
      network_id: 16,
      gas: 0xffffffffff,
      gasPrice: 0x01
    }
  }
}
