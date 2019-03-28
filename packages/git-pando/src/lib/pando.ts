import ETHProvider from 'eth-provider'
import ora from 'ora'
import contractor from 'truffle-contract'
import die from './die'
import { IPandoOptions, PandoOptions } from './types'

// OK
const _artifacts = ['Kernel', 'ACL', 'PandoKit', 'PandoColony', 'PandoRepository'].map(name => {
  switch (name) {
    case 'PandoKit':
      return require(`@pando/kit/build/contracts/${name}.json`)
    case 'PandoColony':
      return require(`@pando/colony/build/contracts/${name}.json`)
    case 'PandoRepository':
      return require(`@pando/repository/build/contracts/${name}.json`)
    default:
      return require(`@aragon/os/build/contracts/${name}.json`)
  }
})

// OK
const _timeout = async (duration: any): Promise<void> => {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, duration)
  })
}

export default class Pando {
  // OK
  public static async create(options: IPandoOptions): Promise<Pando> {
    return new Pando(await this._defaults(options))
  }

  // OK
  private static async _defaults(options: IPandoOptions): Promise<PandoOptions> {
    const provider = await this._provider(options)
    const network = options.ethereum.network ? options.ethereum.network : 'devchain'
    const ethereum = { account: options.ethereum.account, network, provider }

    switch (network) {
      case 'devchain':
        return {
          apm: { ens: '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1' },
          ethereum,
          ipfs: options.ipfs,
        }
      case 'rinkeby':
        return {
          apm: { ens: '0x98Df287B6C145399Aaa709692c8D308357bC085D' },
          ethereum,
          ipfs: options.ipfs,
        }
      default:
        return {
          apm: { ens: '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1' },
          ethereum,
          ipfs: options.ipfs,
        }
    }
  }

  // OK
  private static async _provider(options: IPandoOptions): Promise<any> {
    const provider = ETHProvider(options.ethereum.gateway)
    const spinner = ora('Connecting to Ethereum').start()

    while (true) {
      try {
        const accounts = await provider.send('eth_accounts')
        spinner.stop()
        for (const account of accounts) {
          if (account === options.ethereum.account) return provider
        }
        die("Failed to access your Ethereum account. Update your gateway configuration or run 'git pando config' to select another account.")
      } catch (err) {
        if (err.code === 4100 || err.code === 4001) {
          spinner.text = `Error connecting to Ethereum. ${err.message}.`
          await _timeout(2000)
        } else {
          spinner.stop()
          die('Failed to connect to Ethereum. Make sure your Ethereum gateway is running.')
        }
      }
    }
  }

  // OK
  public artifacts: any
  public options: PandoOptions

  // OK
  constructor(options: PandoOptions) {
    this.artifacts = Object.assign({}, ..._artifacts.map(artifact => contractor(artifact)).map(artifact => ({ [artifact._json.contractName]: artifact })))
    this.options = options

    for (const artifact in this.artifacts) {
      if (this.artifacts.hasOwnProperty(artifact)) {
        this.artifacts[artifact].setProvider(this.options.ethereum.provider)
        this.artifacts[artifact].defaults({ from: this.options.ethereum.account, gasPrice: 20000000000 })
        this.artifacts[artifact].autoGas = true
      }
    }
  }
}
