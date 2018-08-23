/* eslint-disable import/no-duplicates */
import Pando from '../lib'
import Repository from '../lib/components/repository'
// import Kernel from '../lib/contracts'
/* eslint-enable import/no-duplicates */
import { opts } from './data'
import chai from 'chai'
import path from 'path'
import Web3 from 'Web3'
import 'chai/register-should'
import ethers from 'ethers'

chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))

const expect = chai.expect


// const emitter = new PandoEmitter();


// pando.use({signer: })
//
// this.signer = data.signer



// const Kernel = {
//   artifact: require('@aragon/os/build/contracts/Kernel.json'),
//   deploy: async wallet => {
//     const transaction = ethers.Contract.getDeployTransaction(
//       Kernel.artifact.bytecode,
//       Kernel.artifact.abi
//     )
//     transaction.gasLimit = await wallet.estimateGas(transaction)
//     const tx = await wallet.sendTransaction(transaction)
//     const address = ethers.utils.getContractAddress(tx)
//     const kernel = new ethers.Contract(address, Kernel.artifact.abi, wallet)
//     // console.log('Factory: ' + factoryAddress)
//     return { kernel, tx }
//   }
// }

// const ACL = {
//   artifact: require('@aragon/os/build/contracts/ACL.json'),
//   deploy: async wallet => {
//     let transaction = ethers.Contract.getDeployTransaction(
//       ACL.artifact.bytecode,
//       ACL.artifact.abi
//     )
//     transaction.gasLimit = await wallet.estimateGas(transaction)
//     const tx = await wallet.sendTransaction(transaction)
//     const address = ethers.utils.getContractAddress(tx)
//     const acl = new ethers.Contract(address, ACL.artifact.abi, wallet)
//     return { acl, tx }
//   }
// }
//
// const DAOFactory = {
//   artifact: require('@aragon/os/build/contracts/DAOFactory.json'),
//   // interface: new ethers.Interface(DAOFactory.artifact.abi),
//   deploy: async (wallet, kernel, acl) => {
//     let transaction = ethers.Contract.getDeployTransaction(
//       DAOFactory.artifact.bytecode,
//       DAOFactory.artifact.abi,
//       kernel,
//       acl,
//       '0x0000000000000000000000000000000000000000'
//     )
//     let gasLimit = await wallet.estimateGas(transaction)
//     transaction.gasLimit = gasLimit
//     return wallet.sendTransaction(transaction)
//   }
// }

import ContractFactory from '../lib/contracts'
import { Kernel, ACL, DAOFactory } from '../lib/contracts'

const main = async () => {
  var mnemonic =
    'journey nice rather ball theme used uncover gate pond rifle between state'
  var wallet = ethers.Wallet.fromMnemonic(mnemonic)
  var provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
  wallet.provider = provider

  process.on('waiting', (hash) => console.log('Waiting for transaction ' + hash));
  process.on('mined', (hash) => console.log('Mined ' + hash));


let pool = 0
let alpha = 1
let beta = 0.5

const bPrize = () => {
  return alpha * pool

}

const sPrize = () => {
  return beta * pool

}

const buy = (amount, duration) => {
  pool = pool + amount

}


//
//   let { instance: kernel, tx: tx } = await Kernel.deploy(wallet)
//   let { instance: acl, tx: tx2 } = await ACL.deploy(wallet)
//   let { instance: daoFactory, tx: tx3 } = await DAOFactory.deploy(wallet, kernel.address, acl.address, '0x0000000000000000000000000000000000000000')
//
//
//
//
//   console.log(kernel.address)
//   console.log(acl.address)
//
//   console.log(daoFactory.address)
//
// const tx4 = await daoFactory.newDAO(wallet.address)
// daoFactory.$emit('waiting', tx4.hash)
// await wallet.provider.waitForTransaction(tx4.hash)
// daoFactory.$emit('mined', tx4.hash)
// const data = await DAOFactory.extractEvent(wallet.provider, 'DeployDAO', tx4)
//
// console.log(data)
// //






// this.pando.emit

  // const { acl, txACL } = await ACL.deploy(wallet)
  // const { daoFactory, txDAOFactory } = await DAOFactory.deploy(
  //   wallet,
  //   kernel.address,
  //   acl.address
  // )






  //
  // const { dao, txDAO } = await daoFactory.newDAO()
  //
  // console.log(wallet.address)
  // var transaction = await Kernel.deploy(wallet)
  // var kernelAddress = ethers.utils.getContractAddress(transaction)
  // console.log('Kernel: ' + kernelAddress)
  // transaction = await ACL.deploy(wallet)
  // var aclAddress = ethers.utils.getContractAddress(transaction)
  // console.log('ACL: ' + aclAddress)
  // transaction = await Factory.deploy(wallet, kernelAddress, aclAddress)
  // var factoryAddress = ethers.utils.getContractAddress(transaction)
  // console.log('Factory: ' + factoryAddress)
  //
  // const factory = new ethers.Contract(
  //   factoryAddress,
  //   Factory.artifact.abi,
  //   wallet
  // )

  // const tx = await factory.newDAO(wallet.address)
  // const receipt = await wallet.provider.getTransactionReceipt(tx.hash)
  //
  //
  //
  // const i = new ethers.Interface(Factory.artifact.abi)
  //
  // const log = receipt.logs.filter(
  //   l => l.topics[0] === i.events.DeployDAO.topics[0]
  // )[0]
  // const data = i.events.DeployDAO.parse(i.events.DeployDAO.topics, log.data)
  //
  // console.log(data)
  //
  // console.log(i.events.DeployDAO.topics)



/// RESIDUS



  // Interface {
  //   abi: [Getter],
  //   functions: {},
  //   events: { FundUpdated: { [Function: func] inputs: [Getter] } },
  //   deployFunction: { [Function: func] inputs: [Getter] } }
  // > var info = i.events.FundUpdated()
  // EventDescription {
  //   inputs: [ { type: 'uint256', name: 'something' } ],
  //   name: 'FundUpdated',
  //   signature: 'FundUpdated(uint256)',
  //   topics:
  //    [ '0xe34c389652410c46bb438dd3b75c4e2665251c032d7cf198239862e556751e6a' ],
  //   parse: [Function] }
  // > var topics = [ '0xe34c389652410c46bb438dd3b75c4e2665251c032d7cf198239862e556751e6a' ];
  // > var data = '0x00000000000000000000000000000000000000000000000000000000000000ca'
  // > info.parse(topics, data)
  // Result {
  //   '0': BigNumber { _bn: <BN: ca> },
  //   something: BigNumber { _bn: <BN: ca> },
  //   length: 1 }
  //
  //
  //
  //   console.log(receipt.logs[5].topics)
}



// let pando = Pando.create({ ipfs: { ...}, ethereum:  })

//
// [ethereum]
//   [provider]
//     type: Infura, RPC, Etherscan, Web3
//     network: (if infura or Etherscan)
//     url: (if RPC)
//   [signer]
//     type: privateKey or encyrpted or mnemonic or brain or metamask
//     mnemonic: (if mnemonic)


  // new ethers . Wallet( privateKey [ , provider ] )
  // Creates a new instance from privateKey and optionally connect a provider
  // ethers . Wallet . createRandom ( [ options ] )
  // Creates a new random wallet; options may specify extraEntropy to stir into the random source (make sure this wallet is stored somewhere safe; if lost there is no way to recover it)
  // ethers . Wallet . fromEncryptedWallet ( json, password [ , progressCallback ] )
  // Decrypt an encrypted Secret Storage JSON Wallet (from Geth, or that was created using prototype.encrypt )
  // ethers . Wallet . fromMnemonic ( mnemonic [ , path ] )
  // Generate a BIP39 + BIP32 wallet from a mnemonic deriving path
  //
  // default: path=”m/44’/60’/0’/0/0”
  //
  // ethers . Wallet . fromBrainWallet ( username , password [ , progressCallback ] )
  // Generate a wallet from a username and password

// get wallet =
// switch wallet.type
// if metamask return prowider.get signer



// let kernel = await pando.contracts.Kernel.at(address, { signer: true})







// const kernelBase = await this.repository.pando.contracts.kernel.new()
// const aclBase = await this.repository.pando.contracts.acl.new()
// const factory = await this.repository.pando.contracts.daoFactory.new(
//   kernelBase.address,
//   aclBase.address,
//   '0x00'
// )
// const appProxyFactory = await this.repository.pando.contracts.appProxyFactory.new()
//
// // Deploy aragonOS-based DAO
// const receipt = await factory.newDAO(this.repository.config.author.account)

// Create a wallet to deploy the contract with
// var privateKey =
//   '0x0123456789012345678901234567890123456789012345678901234567890123'
// var wallet = new ethers.Wallet(privateKey, provider)

// Send the transaction

// const gasP = wallet.estimateGas(deploy)
//
// // deployTransaction.gasLimit = 1500000;
// // deployTransaction.gasPrice = 10000000000;
//
// // deploy.gasLimit = 0xfffffffff
//
// gasP.then(g => {
//   console.log(g)
//   deploy.gasLimit = g
//
//   var sendPromise = wallet.sendTransaction(deploy)
//
//   // Get the transaction
//   sendPromise.then(function(transaction) {
//     console.log(transaction)
//   })
// })

main()
