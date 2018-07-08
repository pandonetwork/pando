import * as display from '@ui/display'
import * as inquirer from 'inquirer'
import Web3 from 'web3'
import HDWalletProvider from 'truffle-hdwallet-provider'

export const questions = {
  /* tslint:disable:object-literal-sort-keys */

  signer: {
    name: 'type',
    type: 'list',
    message: 'Account type',
    choices: ['Unlocked account', 'HD wallet / mnemonic']
  },
  mnemonic: {
    name: 'words',
    type: 'input',
    message: 'Mnemonic: '
  },
  ethereum: {
    name: 'ethereum.gateway',
    type: 'input',
    message: 'Ethereum node URL: ',
    default: 'http://localhost:8545',
    validate: async (value: string) => {
      const regex = new RegExp(
        /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/
      )

      if (value.match(regex)) {
        const provider = new Web3.providers.HttpProvider(value)
        const web3 = new Web3(provider)
        try {
          await web3.eth.getAccounts()
          return true
        } catch (err) {
          return 'Unable to connect to ' + value
        }
      } else {
        return 'Invalid URL'
      }
    }
  },

  /* tslint:disable:object-literal-sort-keys */
  ipfs: {
    name: 'ipfs.gateway',
    type: 'input',
    message: 'IPFS node URL: ',
    default: 'http://localhost:5001',
    validate: async (value: string) => {
      const regex = new RegExp(
        /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/
      )
      if (value.match(regex)) {
        return true
      } else {
        return 'Invalid URL'
      }
    }
  },

  author: async (provider: any): Promise<any> => {
    const question = {
      name: 'author.account',
      type: 'list',
      message: 'Account: ',
      choices: async (): Promise<string[]> => {
        const web3 = new Web3(provider)
        const accounts = await web3.eth.getAccounts()
        return accounts
      },
      default: 0
    }
    return question
  }
}

export const prompt = {
  configure: async (): Promise<any> => {
    let provider
    let author = { author: { account: '' } }

    const ipfs = await inquirer.prompt(questions.ipfs)
    const ethereum = await inquirer.prompt(questions.ethereum)
    const signer = await inquirer.prompt(questions.signer)
    if (signer.type === 'Unlocked account') {
      provider = new Web3.providers.HttpProvider(ethereum.gateway)
      author = await inquirer.prompt(await questions.author(provider))
    } else if (signer.type === 'HD wallet / mnemonic') {
      const mnemonic = await inquirer.prompt(await questions.mnemonic)
      ethereum.ethereum.mnemonic = mnemonic.words

      provider = new HDWalletProvider(mnemonic.words, ethereum.gateway)
      const web3 = new Web3(provider)
      console.log(web3.version)
      author.author.account = (await web3.eth.getAccounts())[0]
    }

    return { ...author, ...ethereum, ...ipfs }
  }
}
/* tslint:enable:object-literal-sort-keys */
export default prompt
