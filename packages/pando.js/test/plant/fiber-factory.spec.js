/* eslint-disable import/no-duplicates */
import fs from 'fs-extra'
import path from 'path'
import capture from 'collect-console'
import chai from 'chai'
import promised from 'chai-as-promised'

import Pando from '../../lib/'
// import Fiber      from '../../lib/fiber'

import fixtures   from '../helpers/fixtures'

chai.use(promised)

const expect = chai.expect
const should = chai.should()

const account = '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7'
const gateway = { fake: { protocol: 'ws', host: '192.168.0.1', port: '8546' } }
const options = { ethereum: { account: account }}

describe('pando/plant/fibers', () => {
  let pando, plant, master, fiber

  const initialize = async () => {
    pando  = await Pando.create(options)
    plant  = await pando.plants.create(path.join('test', 'fixtures'))
    master = await plant.fibers.load('master')
  }

  const clean = async () => {
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
    })

    after(async () => {
      await clean()
    })

    describe('with name', () => {
      it("it should return true if fiber exists", async () => {
        const exists = await plant.fibers.exists('master')

        exists.should.equal(true)
      })

      it("it should return false if fiber does not exist", async () => {
        const exists = await plant.fibers.exists('doesnotexist')

        exists.should.equal(false)
      })
    })

    describe('with uuid', () => {
      it("it should return true if fiber exists", async () => {
        const exists = await plant.fibers.exists(master.uuid, { uuid: true })

        exists.should.equal(true)
      })

      it("it should return false if fiber does not exist", async () => {
        const exists = await plant.fibers.exists('doesnotexist', { uuid: true })

        exists.should.equal(false)
      })
    })
  })

  describe('#create', () => {
    before(async () => {
      await initialize()
    })

    it('it should initialize fiber', async () => {
      fiber = await plant.fibers.create('dev')

      fiber.uuid.should.exist
      fiber.index.should.exist
      fiber.snapshots.should.exist
      fiber.plant.should.deep.equal(plant)
      fiber.paths.root.should.equal(path.join(plant.paths.fibers, fiber.uuid))
      fiber.paths.index.should.equal(path.join(plant.paths.fibers, fiber.uuid, 'index'))
      fiber.paths.snapshots.should.equal(path.join(plant.paths.fibers, fiber.uuid, 'snapshots'))
    })

    it("it should initialize fiber's directory structure", async () => {
      fs.pathExistsSync(path.join(plant.paths.fibers, fiber.uuid)).should.equal(true)
      fs.pathExistsSync(path.join(plant.paths.fibers, fiber.uuid, 'stash')).should.equal(true)
    })

    it('it should reject with error E_FIBER_NAME_ALREADY_EXISTS if fiber already exists', async () => {
      return plant.fibers.create('master').should.be.rejectedWith('E_FIBER_NAME_ALREADY_EXISTS')
    })

    describe('and fork option is enabled', () => {
      let snapshots

      before(async () => {
        await clean()
        await initialize()
        await master.snapshot()
        await master.snapshot()
        await master.snapshot()
        snapshots = await master.log()
        await plant.fibers.create('dev', { fork: true })
        fiber = await plant.fibers.load('dev')
      })

      it("it should fork current's fiber snapshots", async () => {
        const snaps = await fiber.log()

        snaps.should.deep.equal(snapshots)
      })

      it('it should stash current / created fiber', async () => {
        fs.pathExistsSync(path.join(plant.paths.fibers, fiber.uuid, 'stash', 'test.md')).should.equal(true)
        fs.pathExistsSync(path.join(plant.paths.fibers, fiber.uuid, 'stash', 'dir', 'test_1.md')).should.equal(true)
        fs.pathExistsSync(path.join(plant.paths.fibers, fiber.uuid, 'stash', 'dir', 'test_2.md')).should.equal(true)
        fs.pathExistsSync(path.join(plant.paths.fibers, fiber.uuid, 'stash', 'dir', 'sub', 'test.md')).should.equal(true)
      })

      describe('and open option is enabled', () => {
        before(async () => {
          await clean()
          await initialize()
          fiber = await plant.fibers.create('dev', { fork: true, open: true })
        })

        after(async () => {
          await clean()
        })

        it("it should open fiber's index and snapshots databases", async () => {
          fiber.index.db.isOpen().should.equal(true)
          fiber.snapshots.isOpen().should.equal(true)
        })
      })

    })
  })

  describe('#load', () => {
    beforeEach(async () => {
      await initialize()
      fiber = await plant.fibers.create('dev')
    })

    afterEach(async () => {
      await clean()
    })

    describe('with name', () => {
      it("it should return fiber", async () => {
        const dev = await plant.fibers.load('dev')

        dev.uuid.should.equal(fiber.uuid)
      })

      it("it should reject with error E_FIBER_NOT_FOUND if fiber does not exist", async () => {
        return plant.fibers.load('doesnotexist').should.be.rejectedWith('E_FIBER_NOT_FOUND')
      })
    })

    describe('with uuid', () => {
      it("it should return fiber", async () => {
        const dev = await plant.fibers.load(fiber.uuid, { uuid: true })

        dev.uuid.should.equal(fiber.uuid)
      })

      it("it should reject with error E_FIBER_NOT_FOUND if fiber does not exist", async () => {
        return plant.fibers.load('doesnotexist', { uuid: true }).should.be.rejectedWith('E_FIBER_NOT_FOUND')
      })
    })
  })

  describe('#uuid', () => {
    before(async () => {
      await initialize()
    })

    after(async () => {
      await clean()
    })

    it("it should return fiber's uuid if fiber exists", async () => {
      const uuid = await plant.fibers.uuid('master')

      uuid.should.equal(master.uuid)
    })

    it('it should return undefined if fiber does not exist', async () => {
      const uuid = await plant.fibers.uuid('doesnotexist')
      const type = typeof undefined

      type.should.equal('undefined')
    })
  })

  describe('#current', () => {
    describe('uuid option is disabled', () => {
      before(async () => {
          await initialize()
          fiber = await plant.fibers.create('dev')
          await plant.fibers.switch('dev')
      })

      after(async () => {
          await clean()
      })

      it('it should return current fiber', async () => {
          let current = await plant.fibers.current()

          current.uuid.should.equal(fiber.uuid)
      })
    })

    describe('uuid option is enabled', () => {
      before(async () => {
        await initialize()
        fiber = await plant.fibers.create('dev')
        await plant.fibers.switch('dev')
      })

      after(async () => {
        await clean()
      })

      it("it should return current fiber's uuid", async () => {
        let uuid = await plant.fibers.current({ uuid: true })

        uuid.should.equal(fiber.uuid)
      })
    })
  })

  describe('#list', () => {
    before(async () => {
      await initialize()
      await plant.fibers.create('dev')
      await plant.fibers.create('next')
      await plant.fibers.create('beta')

    })

    after(async () => {
      await clean()
    })

    it("it should return plant's fibers", async () => {
      const fibers = await plant.fibers.list()

      fibers.length.should.equal(4)
      fibers[0].name.should.equal('master')
      fibers[1].name.should.equal('dev')
      fibers[2].name.should.equal('next')
      fibers[3].name.should.equal('beta')
    })

  })

  describe('#switch', () => {
    before(async () => {
      await initialize()
      fiber = await plant.fibers.create('dev')
      await fixtures.files.delete()
      await fixtures.directories.delete()
    })

    after(async () => {
      await clean()
    })

    it("it should switch fiber", async () => {
      await plant.fibers.switch('dev')
    })

    it("it should stash current fiber", async () => {
      fs.pathExistsSync(path.join(plant.paths.fibers, master.uuid, 'stash', 'test.md')).should.equal(false)
      fs.pathExistsSync(path.join(plant.paths.fibers, master.uuid, 'stash', 'dir', 'test_1.md')).should.equal(true)
      fs.pathExistsSync(path.join(plant.paths.fibers, master.uuid, 'stash', 'dir', 'test_2.md')).should.equal(true)
      fs.pathExistsSync(path.join(plant.paths.fibers, master.uuid, 'stash', 'dir', 'sub', 'test.md')).should.equal(false)
    })

    it("it should unstash destination fiber", async () => {
      fs.pathExistsSync(path.join(plant.paths.root, 'test.md')).should.equal(true)
      fs.pathExistsSync(path.join(plant.paths.root, 'dir', 'test_1.md')).should.equal(true)
      fs.pathExistsSync(path.join(plant.paths.root, 'dir', 'test_2.md')).should.equal(true)
      fs.pathExistsSync(path.join(plant.paths.root, 'dir', 'sub', 'test.md')).should.equal(true)
    })

    it("it should update plant's current fiber", async () => {
      const uuid = await plant.fibers.current({ uuid: true })

      uuid.should.equal(fiber.uuid)
    })

    it('it should reject with error E_FIBER_NOT_FOUND if fiber does not exist', async () => {
      return plant.fibers.switch('doesnotexist').should.be.rejectedWith('E_FIBER_NOT_FOUND')
    })
  })
//
//   describe('#rename', () => {})
})
