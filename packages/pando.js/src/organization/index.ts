import Pando from '..'
import Aragon from '@aragon/wrapper'

const APP_IDS = {
  'colony': '0x7b1ecd00360e711e0e2f5e06cfaa343df02df7bce0566ae1889b36a81c7ac7c7',
  'scheme': '0x7dcc2953010d38f70485d098b74f6f8dc58f18ebcd350267fa5f62e7cbc13cfe'
}

export default class Organization {
  public pando:  Pando
  public kernel: any
  public acl:    any

  constructor(pando: Pando, kernel: any, acl: any) {
    this.pando  = pando
    this.kernel = kernel
    this.acl    = acl

    // console.log(kernel)


// Initialises the wrapper and logs the installed apps


  }

  public async initialize(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      const aragon = new Aragon(this.kernel.address, {
        accounts:
          { providedAccounts: [this.pando.options.ethereum.account] },
        provider: this.pando.options.ethereum.provider,
        apm: { ensRegistryAddress: this.pando.options.apm.ens }
      })

      console.log(aragon)

      await aragon.init({
        accounts:
          { providedAccounts: [this.pando.options.ethereum.account] }
        // provider: this.pando.options.ethereum.provider,
        // apm: { ensRegistryAddress: this.pando.options.apm.ens }
      })
      // await aragon.initApps()

      console.log('initialized')

      aragon.apps.subscribe((apps) => {
        console.log(apps)
        for (let app of apps) {
          if (app.appId === APP_IDS.colony) {
            console.log('COLONY')
            console.log(app)
          }

          if (app.appId === APP_IDS.scheme) {
            console.log('SCHEME')
            console.log(app)
          }
        }
        resolve()
        process.exit()
      })


      // aragon.apps.subscribe(
      //     (apps) => {
      //       console.log(apps)
      //       resolve()
      //     }
      //   )

      // aragon.init(() => {
      //   console.log('is Initialized')
      //   aragon.apps.subscribe(
      //     (apps) => {
      //       console.log(apps)
      //       resolve()
      //     }
      //   )
      // })
    })
  }
}
