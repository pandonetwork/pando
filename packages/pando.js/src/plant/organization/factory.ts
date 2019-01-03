import npath from 'path'
import Level from 'level'
import APM          from '@aragon/apm'
import Web3         from 'web3'
import PandoError   from '../../error'
import Pando        from '../..'
import Plant        from '..'
import Organization from '.'
import Aragon from '@aragon/wrapper'

const APP_IDS = {
  'acl': '0xe3262375f45a6e2026b7e7b18c2b807434f2508fe1a2a3dfb493c7df8f4aad6a',
  'colony': '0x7b1ecd00360e711e0e2f5e06cfaa343df02df7bce0566ae1889b36a81c7ac7c7',
  'scheme': '0x7dcc2953010d38f70485d098b74f6f8dc58f18ebcd350267fa5f62e7cbc13cfe'
}


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

  public async exists({ name, address }: { name?: string , address?: string } = {}): Promise<boolean> {
    if (typeof name === 'undefined' && typeof address === 'undefined')
      throw new PandoError('E_WRONG_PARAMETERS', name, address)

    address = typeof address !== 'undefined' ? address : await this.address(name as string)

    if (typeof address === 'undefined')
      return false

    return new Promise<boolean>((resolve, reject) => {
      this.db.get(address, (err, value) => {
        if (err) {
          if (err.notFound) {
            resolve(false)
          } else {
            reject(err)
          }
        } else {
          resolve(true)
        }
      })
    })
  }

  public async deploy(name: string): Promise<any> {
    if (await this.exists({ name }))
      throw new PandoError('E_ORGANIZATION_NAME_ALREADY_EXISTS', name)

    const apm     = APM(new Web3(this.plant.pando.options.ethereum.provider), { ensRegistryAddress: this.plant.pando.options.apm.ens, ipfs: 'http://locahost:5001' })
    const factory = await this.plant.pando.contracts.OrganizationFactory.at(await apm.getLatestVersionContract('organization-factory.aragonpm.eth'))
    const receipt = await factory.newInstance()

    const organization = await this.add(name, this._getDAOAddressFromReceipt(receipt))

    return organization
  }

  public async add(name: string, address: string): Promise<Organization> {
    if (await this.exists({ name }))
      throw new PandoError('E_ORGANIZATION_NAME_ALREADY_EXISTS', name)

    if (await this.exists({ address }))
      throw new PandoError('E_ORGANIZATION_ALREADY_EXISTS', address)

    return new Promise<any>(async (resolve, reject) => {
      let kernel, acl, colony, scheme

      kernel = await this.plant.pando.contracts.Kernel.at(address)

      const aragon = new Aragon(address, {
        provider: this.plant.pando.options.ethereum.provider,
        apm: { ensRegistryAddress: this.plant.pando.options.apm.ens }
      })

      await aragon.init({
        accounts:
          { providedAccounts: [this.plant.pando.options.ethereum.account] }
      })

      let subscription = aragon.apps
        .take(1)
        .subscribe(async (apps) => {
          for (let app of apps) {
            switch (app.appId) {
              case APP_IDS.acl:
                acl = await this.plant.pando.contracts.ACL.at(app.proxyAddress)
                break
              case APP_IDS.colony:
                colony = await this.plant.pando.contracts.Colony.at(app.proxyAddress)
                break
              case APP_IDS.scheme:
                scheme = await this.plant.pando.contracts.DemocracyScheme.at(app.proxyAddress)
                break
            }
        }

        subscription.unsubscribe()

        const organization = new Organization(this.plant, address, kernel, acl, colony, scheme)

        await this.db.put(
          organization.address,
          {
            name,
            acl: organization.acl.address,
            colony: organization.colony.address,
            scheme: organization.scheme.address
          }
        )

        resolve(organization)
      })
    })

  }

  public async delete({ name, address }: { name?: string , address?: string } = {}): Promise<void> {
    if (typeof name === 'undefined' && typeof address === 'undefined')
      throw new PandoError('E_WRONG_PARAMETERS', name, address)

    if (!await this.exists({ name, address }))
      throw new PandoError('E_ORGANIZATION_NOT_FOUND')

    address = typeof address !== 'undefined' ? address : await this.address(name as string)

    await this.db.del(address)
  }

  public async load({ name, address }: { name?: string , address?: string } = {}): Promise<Organization> {
    if (typeof name === 'undefined' && typeof address === 'undefined')
      throw new PandoError('E_WRONG_PARAMETERS', name, address)

    if (!await this.exists({ name, address }))
      throw new PandoError('E_ORGANIZATION_NOT_FOUND')

    address = typeof address !== 'undefined' ? address : await this.address(name as string)

    const organization = await this.db.get(address)

    const kernel = await this.plant.pando.contracts.Kernel.at(address as string)
    const acl    = await this.plant.pando.contracts.ACL.at(organization.acl)
    const colony = await this.plant.pando.contracts.Colony.at(organization.colony)
    const scheme = await this.plant.pando.contracts.DemocracyScheme.at(organization.scheme)

    return new Organization(this.plant, address as string, kernel, acl, colony, scheme)
  }

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

  private _getDAOAddressFromReceipt(receipt: any): string {
    return receipt.logs.filter(l => l.event == 'DeployInstance')[0].args.dao
  }
}
