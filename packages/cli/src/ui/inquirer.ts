import { PWebsocketProvider } from '@pando/types'
import * as inquirer from 'inquirer'
import HDWalletProvider from 'truffle-hdwallet-provider'
import Web3 from 'web3'
import * as display from './display'

const _provider = (configuration): PWebsocketProvider => {
  const url =
    configuration.ethereum.gateway.protocol +
    '://' +
    configuration.ethereum.gateway.host +
    ':' +
    configuration.ethereum.gateway.port

  return new Web3.providers.WebsocketProvider(url) as PWebsocketProvider
}

const questions = {
  /* tslint:disable:object-literal-sort-keys */
  ethereum: {
    gateway: {
      protocol: {
        name: 'result',
        type: 'list',
        message: 'Ethereum gateway protocol',
        choices: ['ws', 'ipc'],
        default: 'ws'
      },
      host: {
        name: 'result',
        type: 'input',
        message: 'Ethereum gateway host',
        default: 'localhost',
      },
      port: {
        name: 'result',
        type: 'input',
        message: 'Ethereum gateway port',
        default: '8545',
      }
    },
    account: async (provider: any): Promise<any> => {
      const question = {
        name: 'result',
        type: 'list',
        message: 'Ethereum account',
        choices: async (): Promise<string[]> => {
          const web3     = new Web3(provider)
          const accounts = await web3.eth.getAccounts()
          return accounts
        },
        default: 0
      }
      return question
    }
  }
}

export const prompt = {
  configure: async (): Promise<any> => {
    const configuration = {
      ethereum: {
        account: undefined,
        gateway: {
          protocol: undefined,
          host: undefined,
          port: undefined
        }
      }
    }

    configuration.ethereum.gateway.protocol = (await inquirer.prompt(questions.ethereum.gateway.protocol)).result
    configuration.ethereum.gateway.host = (await inquirer.prompt(questions.ethereum.gateway.host)).result
    configuration.ethereum.gateway.port = (await inquirer.prompt(questions.ethereum.gateway.port)).result

    const provider = _provider(configuration)
    configuration.ethereum.account = (await inquirer.prompt(await questions.ethereum.account(provider))).result
    provider.connection.close()

    return configuration
  }
}
/* tslint:enable:object-literal-sort-keys */
export default prompt
