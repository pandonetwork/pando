import fs from 'fs-extra'
import npath from 'path'
import IPFS from 'ipfs'
import Pando from '..'
import Plant from '.'
import PandoError from '../error'


export default class PlantFactory {
  public pando: Pando

  public constructor(pando: Pando) {
    this.pando = pando
  }

  public async exists(path: string = '.'): Promise<boolean> {
    let [one, two] = await Promise.all([
      fs.pathExists(npath.join(path, '.pando', 'ipfs')),
      fs.pathExists(npath.join(path, '.pando', 'fibers', 'db')),
      fs.pathExists(npath.join(path, '.pando', 'organizations', 'db'))

    ])

    return one && two
  }

  public async create(path: string = '.'): Promise<Plant> {
    if (await this.exists(path)) {
      throw new PandoError('E_PLANT_ALREADY_EXISTS')
    }

    return new Promise<Plant>(async (resolve, reject) => {
      await Promise.all([
        fs.ensureDir(npath.join(path, '.pando', 'ipfs')),
        fs.ensureDir(npath.join(path, '.pando', 'organizations')),
        fs.ensureDir(npath.join(path, '.pando', 'fibers'))
      ])

      const node = new IPFS({
        repo: npath.join(path, '.pando', 'ipfs'),
        start: false
        // },
        // preload: { enabled: true, addresses: [ '/ip4/127.0.0.1/tcp/4001/',
        // '/ipv4/127.0.0.1/tcp/9999/ws/', '/ipv4/127.0.0.1/tcp/9999/ws/ipfs/QmYS164H7ndSirykbAnf9LJ5VJdAQZGB8a2CvjaaVvSRSq', "/ipv4/127.0.0.1/tcp/9999/ws/ipfs/QmbuTRFUhf8EBRjY8rRKcpKEg3ptECvgyqP2PRDij5h8cK",
        // "/ipv4/127.0.0.1/tcp/9999/ws/ipfs/QmYS164H7ndSirykbAnf9LJ5VJdAQZGB8a2CvjaaVvSRSq",
        // "/ip4/127.0.0.1/tcp/4001/ipfs/QmYS164H7ndSirykbAnf9LJ5VJdAQZGB8a2CvjaaVvSRSq"] }
        })
        .on('error', err => { reject(err) })
        .on('ready', async () => {
          const plant = new Plant(this.pando, path, node)
          await plant.fibers.create('master', { fork: false })
          await plant.fibers.switch('master', { stash: false })
          resolve(plant)
        })
    })
  }

  public async load(path: string = '.'): Promise<Plant> {
    if (!await this.exists(path)) {
      throw new PandoError('E_PLANT_NOT_FOUND', path)
    }

    return new Promise<Plant>(async (resolve, reject) => {
      const node = new IPFS({ repo: npath.join(path, '.pando', 'ipfs'), start: false })
        .on('error', err => { reject(err) })
        .on('ready', async () => {
          resolve(new Plant(this.pando, path, node))
        })
    })
  }
}
