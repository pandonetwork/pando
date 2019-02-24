import Aragon from '@aragon/wrapper'
import Pando from '..'
import PandoError from '../error'

const COLONY_APP_ID = '0x63987fbbd4634a34320d02f82ebf1c6017da9956e3c198ef2ac06bb346f64667'

export default class RepositoryFactory {
  public pando: Pando

  constructor(pando: Pando) {
    this.pando = pando
  }

  public async deploy(organization: string, name: string, description: string): Promise<string> {
    // TODO: assert that organization address is the one of an Aragon DAO
    // TODO: if we are in a git directory also try to resolve the organization by the name of the remote
    // TODO: handle transaction pathing

    const wrapper = new Aragon(organization, {
      provider: this.pando.options.ethereum.provider,
      defaultGasPriceFn: () => String(5e9), // gwei
      apm: {
        ipfs: {},
        ensRegistryAddress: this.pando.options.apm.ens
      }
    })

    await wrapper.init({ accounts: { providedAccounts: [this.pando.options.ethereum.account] } })
    const apps = await this._apps(wrapper)
    const address = apps.filter(app => app.appId === COLONY_APP_ID)[0].proxyAddress
    const colony = await this.pando.contracts.PandoColony.at(address)
    const receipt = await colony.createRepository(name, '')

    return this._getRepositoryAddressFromReceipt(receipt)
  }

  private async _apps(wrapper: Aragon): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      wrapper.apps.subscribe(apps => {
        resolve(apps)
      })
    })
  }

  private _getRepositoryAddressFromReceipt(receipt: any): string {
    return receipt.logs.filter(l => l.event === 'CreateRepository')[0].args.repository
  }
}
