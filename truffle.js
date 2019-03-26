module.exports = {
  networks: {
    devchain: {
      host: "localhost", // Aragon devchain
      port: 8545, // Aragon devchain
      network_id: "*",
      gas: 50e6,
      gasPrice: 1500000000
    },
    rinkeby: {
      host: "localhost", // Frame
      port: "1248", // Frame
      network_id: 4,
      gas: 7587240,
      gasPrice: 15000000001
    }
  },
  compilers: {
    solc: {
      version: "0.4.24"
    }
  }
};
