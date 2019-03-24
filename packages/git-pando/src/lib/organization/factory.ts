import APM from '@aragon/apm'
import Web3 from 'web3'
import Pando from '..'

const APP_IDS = {
  // acl: '0xe3262375f45a6e2026b7e7b18c2b807434f2508fe1a2a3dfb493c7df8f4aad6a',
  colony: '0x63987fbbd4634a34320d02f82ebf1c6017da9956e3c198ef2ac06bb346f64667',
}

export default class OrganizationFactory {
  public pando: Pando

  constructor(pando: Pando) {
    this.pando = pando
  }

  public async deploy(): Promise<string> {
    const apm = APM(new Web3(this.pando.options.ethereum.provider), {
      ensRegistryAddress: this.pando.options.apm.ens,
      ipfs: 'http://locahost:5001',
    })
    const factory = await this.pando.artifacts.PandoKit.at(await apm.getLatestVersionContract('pando-kit.aragonpm.eth'))
    const receipt = await factory.newInstance()
    const address = await this._getDAOAddressFromReceipt(receipt)

    return address
  }

  private _getDAOAddressFromReceipt(receipt: any): string {
    return receipt.logs.filter(l => l.event === 'DeployInstance')[0].args.dao
  }

  private _getColonyAddressFromReceipt(receipt: any): string {
    return receipt.logs.filter(l => l.event === 'InstalledApp' && l.args.appId === APP_IDS.colony)[0].args.appProxy
  }
}
