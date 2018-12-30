import Pando from '../..'
import Plant from '..'
import Aragon from '@aragon/wrapper'

const APP_IDS = {
  'acl': '0xe3262375f45a6e2026b7e7b18c2b807434f2508fe1a2a3dfb493c7df8f4aad6a',
  'colony': '0x7b1ecd00360e711e0e2f5e06cfaa343df02df7bce0566ae1889b36a81c7ac7c7',
  'scheme': '0x7dcc2953010d38f70485d098b74f6f8dc58f18ebcd350267fa5f62e7cbc13cfe'
}

export default class Organization {
  public plant: Plant
  public address: string
  public kernel!: any
  public acl!: any
  public colony!: any
  public scheme!: any


  constructor(plant: Plant, address: string) {
    this.plant = plant
    this.address = address
  }

  public async initialize(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.kernel = await this.plant.pando.contracts.Kernel.at(this.address)

      const aragon = new Aragon(this.address, {
        provider: this.plant.pando.options.ethereum.provider,
        apm: { ensRegistryAddress: this.plant.pando.options.apm.ens }
      })

      await aragon.init({
        accounts:
          { providedAccounts: [this.plant.pando.options.ethereum.account] }
      })

      aragon.apps
        .take(1)
        .subscribe(async (apps) => {
          for (let app of apps) {
            switch (app.appId) {
              case APP_IDS.acl:
                this.acl = await this.plant.pando.contracts.ACL.at(app.proxyAddress)
                break
              case APP_IDS.colony:
                this.colony = await this.plant.pando.contracts.Colony.at(app.proxyAddress)
                break
              case APP_IDS.scheme:
                this.scheme = await this.plant.pando.contracts.DemocracyScheme.at(app.proxyAddress)
                break
            }
        }
        resolve()
      })
    })
  }
}
