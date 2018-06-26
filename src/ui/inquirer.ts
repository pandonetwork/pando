import * as inquirer from 'inquirer'
import * as display  from '@ui/display'
import Web3          from 'web3'


namespace questions {
  export const ethereum = {
    name:    'ethereum.gateway',
    type:    'input',
    message: 'Enter an Ethereum node URL: ',
    default: 'http://localhost:8545',
    validate: async (value: string) => {
      const regex = new RegExp(/(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/)
      
      if (value.match(regex)) {
        let provider = new Web3.providers.HttpProvider(value)
        let web3     = new Web3(provider)
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
  }
  
  export const author = async (ethereum: any): Promise < any > => {
    let question = {
      name: 'author.account',
      type: 'list',
      message: 'Select an account: ',
      choices: async (): Promise < string[] > => {
            let web3 = new Web3(new Web3.providers.HttpProvider(ethereum.gateway))
            let accounts = await web3.eth.getAccounts()
            return accounts
      },
      default: 0
    }
    return question
  }
}

namespace prompt {
  export const configure = async (): Promise < any > => {
    let ethereum = await inquirer.prompt(questions.ethereum)
    let user     = await inquirer.prompt(await questions.author(ethereum))
    
    return { ...user, ...ethereum}
  }
}

export default prompt
