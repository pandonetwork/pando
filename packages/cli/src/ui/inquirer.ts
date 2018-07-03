import * as display from '@ui/display'
import * as inquirer from 'inquirer'
import Web3 from 'web3'

export const questions = {
  /* tslint:disable:object-literal-sort-keys */
  ethereum: {
    name: 'ethereum.gateway',
    type: 'input',
    message: 'Enter an Ethereum node URL: ',
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

  author: async (ethereum: any): Promise<any> => {
    const question = {
      name: 'author.account',
      type: 'list',
      message: 'Select an account: ',
      choices: async (): Promise<string[]> => {
        const web3 = new Web3(new Web3.providers.HttpProvider(ethereum.gateway))
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
    const ethereum = await inquirer.prompt(questions.ethereum)
    const user = await inquirer.prompt(await questions.author(ethereum))

    return { ...user, ...ethereum }
  }
}
/* tslint:enable:object-literal-sort-keys */
export default prompt
