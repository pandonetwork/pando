import chai from 'chai'
import fs from 'fs-extra'
import path from 'path'
import capture from 'collect-console'
import promised from 'chai-as-promised'
import Web3 from 'web3'
import Pando from '../../lib'

import { fixtures } from '@pando/helpers/fixtures'
import { options } from '@pando/helpers/options'

chai.use(promised)
const should = chai.should()


describe('pando/plants', () => {
  let pando, plant

  const initialize = async () => {
    pando = await Pando.create(options)
  }

  const clean = async () => {
    await pando.close()
    const reset = capture.log()

    await plant.node.start()
    await plant.node.stop()

    reset()

    await plant.remove()
    await fixtures.restore()
  }

  describe('#exists', () => {
    before(async () => {
      await initialize()
      plant = await pando.plants.create(path.join('test', 'fixtures'))
    })

    after(async () => {
      await clean()
    })

    it('it should return true if plant exists', async () => {
      const exists = await pando.plants.exists(path.join('test', 'fixtures'))

      exists.should.equal(true)
    })

    it('it should return false if plant does not exist', async () => {
      const exists = await pando.plants.exists('doesnotexist')

      exists.should.equal(false)
    })
  })

  describe('#create', () => {
    before(async () => {
      await initialize()
    })

    after(async () => {
      await clean()
    })

    it('it should return plant', async () => {
      plant = await pando.plants.create(path.join('test', 'fixtures'))

      plant.should.exist
    })

    it('it should initialize plant', async () => {
      plant.pando.should.deep.equal(pando)
      plant.node.should.exist
      plant.fibers.should.exist
      plant.paths.root.should.equal(path.join('test', 'fixtures'))
      plant.paths.pando.should.equal(path.join('test', 'fixtures', '.pando'))
      plant.paths.ipfs.should.equal(path.join('test', 'fixtures', '.pando', 'ipfs'))
      plant.paths.fibers.should.equal(path.join('test', 'fixtures', '.pando', 'fibers'))
    })

    it("it should initialize plant's directory structure", async () => {
      fs.pathExistsSync(plant.paths.pando).should.equal(true)
      fs.pathExistsSync(plant.paths.ipfs).should.equal(true)
      fs.pathExistsSync(plant.paths.fibers).should.equal(true)
    })

    it("it should create master fiber", async () => {
      const exists = await plant.fibers.exists('master')

      exists.should.equal(true)
    })

    it("it should switch to master fiber", async () => {
      const current = await plant.fibers.current({ uuid: true })
      const master  = await plant.fibers.uuid('master')

      current.should.equal(master)
    })

    it('it should reject with error E_PLANT_ALREADY_EXISTS if plant already exists', async () => {
      return pando.plants.create(path.join('test', 'fixtures')).should.be.rejectedWith('E_PLANT_ALREADY_EXISTS')
    })
  })

  describe('#load', () => {
    before(async () => {
      await initialize()
      plant = await pando.plants.create(path.join('test', 'fixtures'))
      // avoid locking issues
      const reset = capture.log()
      await plant.node.start()
      await plant.node.stop()
      await plant.fibers.db.close()
      reset()
    })

    after(async () => {
      await clean()
    })

    it('it should return plant', async () => {
      plant = await pando.plants.load(path.join('test', 'fixtures'))

      plant.should.exist
    })

    it('it should initialize plant', async () => {
      plant.pando.should.deep.equal(pando)
      plant.node.should.exist
      plant.fibers.should.exist
      plant.paths.root.should.equal(path.join('test', 'fixtures'))
      plant.paths.pando.should.equal(path.join('test', 'fixtures', '.pando'))
      plant.paths.ipfs.should.equal(path.join('test', 'fixtures', '.pando', 'ipfs'))
      plant.paths.fibers.should.equal(path.join('test', 'fixtures', '.pando', 'fibers'))
    })

    it('it should reject with error E_PLANT_NOT_FOUND if plant does not exist', async () => {
      return pando.plants.load('doesnotexist').should.be.rejectedWith('E_PLANT_NOT_FOUND')
    })
  })
})
