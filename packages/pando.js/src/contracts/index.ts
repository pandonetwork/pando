import ethers from 'ethers'
import EventEmitter from 'events'

export default class ContractFactory {
  public artifact: any
  public interface: any

  public constructor(artifact: any) {
    // super()
    this.artifact = artifact
    this.interface = new ethers.Interface(artifact.abi)
  }


  public async deploy(signer, ...args): Promise<any> {
    args = [this.artifact.bytecode, this.artifact.abi].concat(args)
    const transaction = ethers.Contract.getDeployTransaction.apply(null,
      args
    )
    transaction.gasLimit = await signer.estimateGas(transaction)
    const tx = await signer.sendTransaction(transaction)
    process.emit('waiting', tx.hash)
    // console.log('Waiting for transaction ' + tx.hash + ' to be mined')
    await signer.provider.waitForTransaction(tx.hash)
    process.emit('mined', tx.hash)
    // console.log('Transaction mined')
    const address = ethers.utils.getContractAddress(tx)
    const instance = new ethers.Contract(address, this.artifact.abi, signer)
    instance.$emit = this.constructor.prototype.emit

    console.log(instance.$emit)

    // console.log('Factory: ' + factoryAddress)
    return { instance, tx }
  }

  public async extractEvent(provider:any, event: string, tx: any) {
    const receipt = await provider.getTransactionReceipt(tx.hash)
    // console.log(receipt)
    const topic = this.interface.events[event].topics[0]
    const log = receipt.logs.filter(l => l.topics[0] === topic)[0]
    const data = this.interface.events[event].parse(this.interface.events[event].topics, log.data)
    return data
  }

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

}





  // public async deploy(signer: any): Promise<any> {
  //   const transaction = ethers.Contract.getDeployTransaction(
  //     Kernel.artifact.bytecode,
  //     Kernel.artifact.abi
  //   )
  //   transaction.gasLimit = await signer.estimateGas(transaction)
  //   const tx = await signer.sendTransaction(transaction)
  //   const address = ethers.utils.getContractAddress(tx)
  //   const kernel = new ethers.Contract(address, Kernel.artifact.abi, signer)
  //   // console.log('Factory: ' + factoryAddress)
  //   return { kernel, tx }
  // }
  //
  // public async at(signer: any): Promise<any> {
  //   const transaction = ethers.Contract.getDeployTransaction(
  //     Kernel.artifact.bytecode,
  //     Kernel.artifact.abi
  //   )
  //   transaction.gasLimit = await signer.estimateGas(transaction)
  //   const tx = await signer.sendTransaction(transaction)
  //   const address = ethers.utils.getContractAddress(tx)
  //   const kernel = new ethers.Contract(address, Kernel.artifact.abi, signer)
  //   // console.log('Factory: ' + factoryAddress)
  //   return { kernel, tx }
  // }


const Kernel = new ContractFactory(require('@aragon/os/build/contracts/Kernel.json'))
const ACL = new ContractFactory(require('@aragon/os/build/contracts/ACL.json'))
const DAOFactory = new ContractFactory(require('@aragon/os/build/contracts/DAOFactory.json'))
export { Kernel, ACL, DAOFactory }
