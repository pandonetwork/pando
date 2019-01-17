import Level from 'level'
import npath from 'path'
import stream from 'stream'
import Organism from '.'
import Organization from '..'
import Pando from '../../..'
import PandoError from '../../../error'

export default class OrganismFactory {
  public organization: Organization
  public path: string
  private _db: Level

  get db(): Level {
    return Level(this.path + '.db', { valueEncoding: 'json' })
  }

  constructor(organization: Organization) {
    this.organization = organization
    this.path = npath.join(organization.plant.paths.organizations, organization.address)
  }

  public async exists({ name, address }: { name?: string; address?: string } = {}): Promise<boolean> {
    if (typeof name === 'undefined' && typeof address === 'undefined') {
      throw new PandoError('E_WRONG_PARAMETERS', name, address)
    }

    address = typeof address !== 'undefined' ? address : await this.address(name as string)

    if (typeof address === 'undefined') {
      return false
    }

    const db = this.db

    return new Promise<boolean>((resolve, reject) => {
      db.get(address, async (err, value) => {
        await db.close()
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
    if (await this.exists({ name })) {
      throw new PandoError('E_ORGANISM_NAME_ALREADY_EXISTS', name)
    }

    if (await this.exists({ address })) {
      throw new PandoError('E_ORGANISM_ALREADY_EXISTS', address)
    }

    const organism = new Organism(this.organization, address)
    const db = this.db

    await db.put(organism.address, { name })
    await db.close()

    return organism
  }

  public async delete({ name, address }: { name?: string; address?: string } = {}): Promise<void> {
    if (typeof name === 'undefined' && typeof address === 'undefined') {
      throw new PandoError('E_WRONG_PARAMETERS', name, address)
    }

    if (!(await this.exists({ name, address }))) {
      throw new PandoError('E_ORGANISM_NOT_FOUND')
    }

    address = typeof address !== 'undefined' ? address : await this.address(name as string)

    const db = this.db

    await db.del(address)
    await db.close()
  }

  public async load({ name, address }: { name?: string; address?: string } = {}): Promise<Organism> {
    if (typeof name === 'undefined' && typeof address === 'undefined') {
      throw new PandoError('E_WRONG_PARAMETERS', name, address)
    }

    if (!(await this.exists({ name, address }))) {
      throw new PandoError('E_ORGANISM_NOT_FOUND')
    }

    address = typeof address !== 'undefined' ? address : await this.address(name as string)

    return new Organism(this.organization, address as string)
  }

  public async list(): Promise<any[]> {
    const organisms: any[] = []
    const db = this.db
    return new Promise<any[]>((resolve, reject) => {
      db.createReadStream()
        .on('data', organism => {
          organisms.push({ address: organism.key, ...organism.value })
        })
        .on('end', async () => {
          await db.close()
          resolve(organisms)
        })
        .on('error', err => {
          reject(err)
        })
    })
  }

  public async address(name: string): Promise<string | undefined> {
    let address: string | undefined
    const db: Level = this.db

    return new Promise<string | undefined>((resolve, reject) => {
      const write = new stream.Writable({
        objectMode: true,
        write: async (organism, encoding, next) => {
          if (organism.value.name === name) {
            address = organism.key
          }
          next()
        },
      })

      write
        .on('finish', async () => {
          await db.close()
          resolve(address)
        })
        .on('error', err => {
          reject(err)
        })

      db.createReadStream()
        .pipe(write)
        .on('finish', async () => {
          await db.close()
        })
        .on('error', err => {
          reject(err)
        })
    })

    // return new Promise<string | undefined>((resolve, reject) => {
    //   this.db
    //     .createReadStream()
    //     .on('data', organism => {
    //       if (organism.value.name === name) {
    //         address = organism.key
    //       }
    //     })
    //     .on('end', () => {
    //       resolve(address)
    //     })
    //     .on('error', err => {
    //       reject(err)
    //     })
    // })
  }

  private _getOrganismAddressFromReceipt(receipt: any): string {
    return receipt.logs.filter(l => l.event === 'DeployOrganism')[0].args.organism
  }
}
