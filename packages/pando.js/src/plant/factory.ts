import fs from 'fs-extra'
import IPFS from 'ipfs'
import Level from 'level'
import npath from 'path'
import FiberFactory from './fiber/factory'
import PandoError from '../error'
import Plant from '.'
import util from 'util'
import Pando from '..'
// import async from 'async';

// import Index from '@pando/index'

const ensure = util.promisify(fs.ensureDir)


export default class PlantFactory {
    public static paths = {
        root:  '.',
        pando: '.pando',
        ipfs: '.pando/ipfs',
        index: '.pando/index',
        db: '.pando/db',
        current: '.pando/current',
        config: '.pando/config',
        fibers: '.pando/fibers',
    }

    public pando: Pando

    public constructor(pando: Pando) {
        this.pando = pando
    }

    public async exists(path: string = '.'): Promise<boolean> {

        let [one, two, three] = await Promise.all([
            fs.pathExists(npath.join(path, '.pando')),
            fs.pathExists(npath.join(path, '.pando', 'ipfs')),
            fs.pathExists(npath.join(path, '.pando', 'fibers', 'db'))
        ])

        return one && two && three
    }

    public async create(path: string = '.'): Promise<Plant> {
      return new Promise<Plant>(async (resolve, reject) => {
        await Promise.all([
          ensure(npath.join(path, '.pando', 'ipfs')),
          ensure(npath.join(path, '.pando', 'fibers'))
        ])

        const node = new IPFS({ repo: npath.join(path, '.pando', 'ipfs'), start: false })
          .on('error', err => {
            reject(err)
          })
          .on('ready', async () => {
            const plant = new Plant(path, node)
            await plant.fibers.create('master', { fork: false })
            await plant.fibers.switch('master', { stash: false })
            resolve(plant)
          })
      })
    }

    public async load(path: string = '.'): Promise<Plant> {
      return new Promise<Plant>(async (resolve, reject) => {
        if (!this.exists(path)) {
          reject(new PandoError('E_PLANT_NOT_FOUND', path))
        }

        const node = new IPFS({ repo: npath.join(path, '.pando', 'ipfs'), start: false })
          .on('error', err => {
            reject(err)
          })
          .on('ready', async () => {
            resolve(new Plant(path, node))
          })
      })
    }


}
