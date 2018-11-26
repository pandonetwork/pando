module.exports = {
  networks: {
    devnet: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },
    rpc: {
      host: 'localhost',
      port: 8545,
      network_id: 15,
      websocket: true,
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
