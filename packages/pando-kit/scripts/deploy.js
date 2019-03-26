#!/usr/bin/env node

const ETHProvider = require('eth-provider')
const contractor = require('truffle-contract')
const MiniMeTokenFactory = contractor(require('../build/contracts/MiniMeTokenFactory.json'))
const PandoKit = contractor(require('../build/contracts/PandoKit.json'))

const _die = message => {
  console.error(message)
  process.exit(1)
}

const _provider = async (gateway, root) => {
  return new Promise(async (resolve, reject) => {
    const provider = ETHProvider(gateway)

    try {
      const accounts = await provider.send('eth_accounts')
      resolve(provider)
    } catch (err) {
      reject(err)
    }
  })
}

const main = async () => {
  return new Promise(async (resolve, reject) => {
    if (process.argv.length < 3) _die('You need to pass a network name as an argument.')

    const devchain = process.argv[2] === 'devchain'
    const ENS = devchain ? '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1' : '0x98Df287B6C145399Aaa709692c8D308357bC085D'
    const gateway = devchain ? 'ws://localhost:8545' : 'ws://localhost:1248'
    const root = devchain ? '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7' : '0x9b1B224E0445243eF5fD102114d15136967FfB15'

    try {
      const provider = await _provider(gateway)

      MiniMeTokenFactory.setProvider(provider)
      MiniMeTokenFactory.defaults({ from: root, gasPrice: 10000000000 })
      // MiniMeTokenFactory.autoGas = true
      // MiniMeTokenFactory.gasMultiplier = 3

      PandoKit.setProvider(provider)
      PandoKit.defaults({ from: root })
      PandoKit.autoGas = true
      PandoKit.gasMultiplier = 1.5

      MiniMeTokenFactory.new()
        .on('error', err => {
          if (!err.message.includes('Failed to subscribe to new newBlockHeaders to confirm the transaction receipts')) {
            _die(err.message)
          }
        })
        .on('transactionHash', hash => {
          console.log('Deploying MiniMeTokenFactory ' + hash)
        })
        .then(factory => {
          PandoKit.new(ENS, factory.address, devchain)
            .on('error', err => {
              if (!err.message.includes('Failed to subscribe to new newBlockHeaders to confirm the transaction receipts')) {
                _die(err.message)
              }
            })
            .on('transactionHash', hash => {
              console.log('Deploying PandoKit: ' + hash)
            })
            .then(kit => {
              resolve(kit.address)
            })
            .catch(err => {
              _die(err.message)
            })
        })
        .catch(err => {
          _die(err.message)
        })
    } catch (err) {
      _die(err.message)
    }
  })
}

main().then(address => {
  console.log(address)
  process.exit(0)
})
