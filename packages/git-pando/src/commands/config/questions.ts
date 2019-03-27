import ETHProvider from 'eth-provider'
import * as inquirer from 'inquirer'
import ora from 'ora'
import Web3 from 'web3'

const FRAME_ENDPOINT = 'ws://localhost:1248'
const FRAME_ORIGIN = 'pando'

const _timeout = async (duration: any): Promise<void> => {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, duration)
  })
}

/* tslint:disable:object-literal-sort-keys */
const questions = {
  ethereum: {
    type: {
      name: 'result',
      type: 'list',
      message: 'How do you want to connect to Ethereum?',
      choices: ['Frame', 'Direct connection [requires an unlocked account]'],
      default: 'Frame',
    },
    gateway: {
      name: 'result',
      type: 'input',
      message: 'Ethereum gateway',
      default: 'ws://localhost:8545',
    },
    account: (accounts: string[]): any => {
      const question = {
        name: 'result',
        type: 'list',
        message: 'Ethereum account',
        choices: accounts,
        default: 0,
      }
      return question
    },
  },
  ipfs: {
    gateway: {
      name: 'result',
      type: 'input',
      message: 'IPFS gateway',
      default: 'https://ipfs.infura.io:5001',
    },
  },
}
/* tslint:enable:object-literal-sort-keys */

export default async (): Promise<any> => {
  const configuration = {
    ethereum: {
      account: undefined as any,
      gateway: undefined as any,
    },
    ipfs: {
      gateway: undefined as any,
    },
  }

  const type = (await inquirer.prompt(questions.ethereum.type)).result
  configuration.ethereum.gateway = type === 'Frame' ? FRAME_ENDPOINT : (await inquirer.prompt(questions.ethereum.gateway)).result

  const provider = ETHProvider(configuration.ethereum.gateway)
  const message = type === 'Frame' ? 'Connecting to Frame' : 'Connecting to Ethereum gateway'
  const spinner = ora(message).start()

  while (true) {
    try {
      const accounts = await provider.send('eth_accounts')
      spinner.stop()
      configuration.ethereum.account = (await inquirer.prompt(await questions.ethereum.account(accounts))).result
      break
    } catch (err) {
      spinner.text = message + ': ' + err.message
      await _timeout(2000)
    }
  }

  configuration.ipfs.gateway = (await inquirer.prompt(questions.ipfs.gateway)).result

  return configuration
}
