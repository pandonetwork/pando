import npath from 'path'
import Level from 'level'
import APM          from '@aragon/apm'
import Web3         from 'web3'
import Pando        from '../..'
import Plant        from '..'
import Organization from '.'

const db = async (location, options): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    Level(location, options, function (err, dbs) {
      if (err) {
        reject(err)
      } else {
        resolve(dbs)
      }
    })
  })
}

export default class OrganizationFactory {
  public plant: Plant
  public db: Level

  constructor(plant: Plant) {
    this.plant = plant
    this.db = Level(npath.join(plant.paths.organizations, 'db'), { valueEncoding: 'json' })
  }

  public async create(name: string): Promise<Organization> {
    const organization = await this.deploy()

    await this.db.put(organization.address,
      {
        name,
        acl: organization.acl.address,
        colony: organization.colony.address,
        scheme: organization.scheme.address
      }
    )

    return organization
  }

  // public async load(nameOrAddress: string, { address = false }: { address?: boolean } = {}): Promise<Organization> {
  //   return new Promise<Organization>((resolve, reject) => {
  //
  //   })
  // }

  public async address(name: string): Promise<string|undefined> {
    let address: string|undefined = undefined

    return new Promise<string|undefined>((resolve, reject) => {
      this.db
        .createReadStream()
        .on('data', organization => {
          if (organization.value.name === name) { address = organization.key }
        })
        .on('end', () => { resolve(address) })
        .on('error', (err) => { reject(err) })
    })
  }

  public async deploy(): Promise<any> {
    const apm     = APM(new Web3(this.plant.pando.options.ethereum.provider), { ensRegistryAddress: this.plant.pando.options.apm.ens, ipfs: 'http://locahost:5001' })
    const factory = await this.plant.pando.contracts.OrganizationFactory.at(await apm.getLatestVersionContract('organization-factory.aragonpm.eth'))
    const receipt = await factory.newInstance()

    // const kernel = await this.plant.pando.contracts.Kernel.at(this._getDAOAddressFromReceipt(receipt))


    const organization = new Organization(this.plant, this._getDAOAddressFromReceipt(receipt))
    await organization.initialize()

    return organization
  }

  private _getDAOAddressFromReceipt(receipt: any): string {
    return receipt.logs.filter(l => l.event == 'DeployInstance')[0].args.dao
  }
}
