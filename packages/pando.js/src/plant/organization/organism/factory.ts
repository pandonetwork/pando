import npath from 'path'
import Level from 'level'
import PandoError from '../../../error'
import Pando from '../../..'
import Organism from '.'
import Organization from '..'


export default class OrganismFactory {
  public organization: Organization
  public db: Level

  constructor(organization: Organization) {
    this.organization = organization
    this.db = Level(npath.join(organization.plant.paths.organizations, organization.address + '.db'), { valueEncoding: 'json' })
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

  public async deploy(name: string): Promise<Organism> {
    const receipt = await this.organization.colony.deploy()
    const address = this._getOrganismAddressFromReceipt(receipt)
    const organism = await this.add(name, address)

    return organism
  }

  public async add(name: string, address: string): Promise<Organism> {
    if (await this.exists({ name }))
      throw new PandoError('E_ORGANISM_NAME_ALREADY_EXISTS', name)

    if (await this.exists({ address }))
      throw new PandoError('E_ORGANISM_ALREADY_EXISTS', address)

    const organism = new Organism(this.organization, address)
    await this.db.put(organism.address, { name })

    return organism
  }

  public async delete({ name, address }: { name?: string , address?: string } = {}): Promise<void> {
    if (typeof name === 'undefined' && typeof address === 'undefined')
      throw new PandoError('E_WRONG_PARAMETERS', name, address)

    if (!await this.exists({ name, address }))
      throw new PandoError('E_ORGANISM_NOT_FOUND')

    address = typeof address !== 'undefined' ? address : await this.address(name as string)

    await this.db.del(address)
  }

  public async load({ name, address }: { name?: string , address?: string } = {}): Promise<Organism> {
    if (typeof name === 'undefined' && typeof address === 'undefined')
      throw new PandoError('E_WRONG_PARAMETERS', name, address)

    if (!await this.exists({ name, address }))
      throw new PandoError('E_ORGANISM_NOT_FOUND')

    address = typeof address !== 'undefined' ? address : await this.address(name as string)

    return new Organism(this.organization, address as string)
  }

  public async list(): Promise<any[]> {
    const organisms: any[] = []

    return new Promise<any[]>((resolve, reject) => {
      this.db
        .createReadStream()
        .on('data', organism => {
          organisms.push({ address: organism.key, ...organism.value })
        })
        .on('end', () => { resolve(organisms) })
        .on('error', (err) => { reject(err) })
    })
  }

  public async address(name: string): Promise<string|undefined> {
    let address: string|undefined = undefined

    return new Promise<string|undefined>((resolve, reject) => {
      this
        .db
        .createReadStream()
        .on('data', organism => {
          if (organism.value.name === name) { address = organism.key }
        })
        .on('end', () => { resolve(address) })
        .on('error', (err) => { reject(err) })
    })
  }

  private _getOrganismAddressFromReceipt(receipt: any): string {
    return receipt.logs.filter(l => l.event == 'DeployOrganism')[0].args.organism
  }

}
