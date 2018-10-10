module.exports = {
  networks: {
    rpc: {
      host: 'localhost',
      port: 8545,
      network_id: 15,
      gas: 0xffffffffff,
      gasPrice: 0x01,
      websocket: true
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
