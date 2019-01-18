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
const expect = chai.expect
const should = chai.should()

let cids = { origin: {}, modified: {}, deleted: {} }

cids.origin['tree'] = 'QmYR98BbbJxi3Nwtxd4ToS8uyAid4HC6NzULa2JGGKMgCy'
cids.origin['test.md'] = 'QmShBmhvEZ1dDwPvLvpjimRW76AQrVz3fbpZYwsqNJN2Xh'
cids.origin[path.join('dir', 'test_1.md')] = 'Qmaij6pBZtRmVf6sUUaJ4rRkwkF78aqT38GP1YSZho7yLY'
cids.origin[path.join('dir', 'test_2.md')] = 'Qme4pabV5DApSeHsuWu6gXa3EyUj58N85hdMfdD7372rnV'
cids.origin[path.join('dir', 'sub', 'test.md')] = 'QmfHhdmitp8duYj8fsvDTkeRWd5szP7qnS4qEC8oCt37Hr'

cids.modified['tree'] = 'QmbHJTpmU1LDNBitKo6mxTe7L7k57o2hqFZXbGtAd3nCKg'
cids.modified['test.md'] = 'QmUenaNZqJKZvz3qMaNaF4VBTpddpnr97wf6REKte7pJtw'
cids.modified[path.join('dir', 'test_1.md')] = 'QmXtt8JV8xAc4R8syRLvYeCkGCkaSd49kTGnZBpfyq2Srq'
cids.modified[path.join('dir', 'test_2.md')] = 'Qme4pabV5DApSeHsuWu6gXa3EyUj58N85hdMfdD7372rnV'
cids.modified[path.join('dir', 'sub', 'test.md')] = 'QmRS8LgmCc4SNbtwxnLmNRhNdFfP2dRDwYUeC8WNkQXuqm'

cids.deleted['test.md'] = 'null'
cids.deleted[path.join('dir', 'test_1.md')] = 'Qmaij6pBZtRmVf6sUUaJ4rRkwkF78aqT38GP1YSZho7yLY'
cids.deleted[path.join('dir', 'test_2.md')] = 'Qme4pabV5DApSeHsuWu6gXa3EyUj58N85hdMfdD7372rnV'
cids.deleted[path.join('dir', 'sub', 'test.md')] = 'null'

let paths = {}

paths['test.md'] = 'test.md'
paths['dir/test_1.md'] = path.join('dir', 'test_1.md')
paths['dir/test_2.md'] = path.join('dir', 'test_2.md')
paths['dir/sub'] = path.join('dir', 'sub')
paths['dir/sub/test.md'] = path.join('dir', 'sub', 'test.md')

describe('fiber', () => {
  let pando, plant, master, index

  const initialize = async () => {
    pando = await Pando.create(options)
    plant = await pando.plants.create(path.join('test', 'fixtures'))
    master = await plant.fibers.load('master')
    index = master.index
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

  describe('#track', () => {
    describe('file exists in wdir', () => {
      before(async () => {
        await initialize()
        await master.index.track([path.join('test', 'fixtures', 'test.md')])
      })

      after(async () => {
        await clean()
      })

      it("it should update file's status to tracked", async () => {
        const status = await master.index.status()

        status.index['test.md'].tracked.should.equal(true)
      })
    })

    describe('file does not exist in wdir', () => {
      describe('but file exists in last snapshot', () => {
        before(async () => {
          await initialize()
          await master.index.track([path.join('test', 'fixtures', 'test.md')])
          await master.snapshot()
          await fixtures.files.delete()
        })

        after(async () => {
          await clean()
        })

        it("it should update file's status to tracked", async () => {
          await master.index.track([path.join('test', 'fixtures', 'test.md')])
          const status = await master.index.status()

          status.index['test.md'].tracked.should.equal(true)
        })
      })

      describe('and file does not exist in last snapshot', () => {
        before(async () => {
          await initialize()
        })

        after(async () => {
          await clean()
        })

        it('it should throw', async () => {
          return master.index.track([path.join('test', 'fixtures', 'doesnotexist')]).should.be.rejected
        })
      })
    })
  })

  describe('#untrack', () => {
    describe('file exists in wdir', () => {
      before(async () => {
        await initialize()
        await master.index.track([path.join('test', 'fixtures', 'test.md')])
        await master.index.untrack([path.join('test', 'fixtures', 'test.md')])
      })

      after(async () => {
        await clean()
      })

      it("it should update file's status to untracked", async () => {
        const status = await master.index.status()

        status.index['test.md'].tracked.should.equal(false)
      })
    })

    describe('file does not exist in wdir', () => {
      describe('but file exists in last snapshot', () => {
        before(async () => {
          await initialize()
          await master.index.track([path.join('test', 'fixtures', 'test.md')])
          await master.snapshot()
          await fixtures.files.delete()
        })

        after(async () => {
          await clean()
        })

        it("it should update file's status to untracked", async () => {
          await master.index.untrack([path.join('test', 'fixtures', 'test.md')])
          const status = await master.index.status()

          status.index['test.md'].tracked.should.equal(false)
        })
      })

      describe('and file does not exist in last snapshot', () => {
        before(async () => {
          await initialize()
        })

        after(async () => {
          await clean()
        })

        it('it should throw', async () => {
          return master.index.untrack([path.join('test', 'fixtures', 'doesnotexist')]).should.be.rejected
        })
      })
    })
  })

  describe('#snapshot', () => {
    let snapshot

    before(async () => {
      await initialize()
      await master.index.track([path.join('test', 'fixtures')])
      await master.snapshot('First snapshot')
      await fixtures.files.modify()
    })

    after(async () => {
      await clean()
    })

    it('it should return created snapshot', async () => {
      snapshot = await master.snapshot('Second snapshot')

      snapshot.should.exist
    })

    it("it should set snapshot's id", async () => {
      snapshot.id.should.equal(1)
    })

    it("it should set snapshot's timestamp", async () => {
      snapshot.timestamp.should.exist
    })

    it("it should set snapshot's message", async () => {
      snapshot.message.should.equal('Second snapshot')
    })

    it("it should set snapshot's tree hash", async () => {
      snapshot.tree.should.equal(cids.modified['tree'])
    })

    it("it should update snapshot's database", async () => {
      let length = await master._length()
      length.should.equal(2)
    })
  })

  describe('#log', () => {
    let log

    before(async () => {
      await initialize()
      await master.index.track([path.join('test', 'fixtures')])
      await master.snapshot('First snapshot')
      await fixtures.files.modify()
      await master.snapshot('Second snapshot')
    })

    after(async () => {
      await clean()
    })

    it('it should return snapshots history', async () => {
      log = await master.log()

      log.should.exist
      log.length.should.equal(2)
    })

    it("it should return each snapshot's id", async () => {
      log[0].id.should.equal(1)
      log[1].id.should.equal(0)
    })

    it("it should return each snapshot's timestamp", async () => {
      log[0].timestamp.should.exist
      log[1].timestamp.should.exist
    })

    it("it should return each snapshot's message", async () => {
      log[0].message.should.equal('Second snapshot')
      log[1].message.should.equal('First snapshot')
    })

    it("it should return each snapshot's tree hash", async () => {
      log[0].tree.should.equal(cids.modified['tree'])
      log[1].tree.should.equal(cids.origin['tree'])
    })

    describe('limit parameter is passed', () => {
      it('it should return #limit last snapshots', async () => {
        log = await master.log({ limit: 1 })

        log.should.exist
        log.length.should.equal(1)
        log[0].id.should.equal(1)
      })
    })
  })

  describe('#revert', () => {
    describe('snapshot exists and all entries exists in snapshots', () => {
      before(async () => {
        await initialize()
        await master.index.track([path.join('test', 'fixtures')])
        await master.snapshot('First snapshot')
        await fixtures.files.modify()
        await fixtures.directories.delete()
      })

      after(async () => {
        await clean()
      })

      it('it should fulfill', async () => {
        // await master.revert(0, [path.join('test', 'fixtures', 'test.md'), path.join('test', 'fixtures', 'dir', 'sub')])
        await master.revert(0, [path.join('test', 'fixtures')])
      })

      it('it should create a backup snapshot', async () => {
        let log = await master.log({ limit: 1 })

        log[0].id.should.equal(1)
        log[0].message.should.equal('Automatic snapshot before reverting to snapshot #0')
      })

      it("it should revert entries back to snapshot's version", async () => {
        let one = await master.index.cid('test.md')
        let two = await master.index.cid(path.join('dir', 'test_1.md'))
        let three = await master.index.cid(path.join('dir', 'test_2.md'))
        let four = await master.index.cid(path.join('dir', 'sub', 'test.md'))

        one.should.equal(cids.origin['test.md'])
        two.should.equal(cids.origin['dir/test_1.md'])
        three.should.equal(cids.origin['dir/test_2.md'])
        four.should.equal(cids.origin['dir/sub/test.md'])
      })
    })

    describe('snapshot does not exist', () => {
      before(async () => {
        await initialize()
        await master.index.track([path.join('test', 'fixtures')])
        await master.snapshot('First snapshot')
        await fixtures.files.modify()
        await fixtures.directories.delete()
      })

      after(async () => {
        await clean()
      })

      it('it should reject with error E_SNAPSHOT_NOT_FOUND', async () => {
        return master.revert(3, [path.join('test', 'fixtures', 'test.md')]).should.be.rejectedWith('E_SNAPSHOT_NOT_FOUND')
      })
    })

    describe('at least one entry does not exist', () => {
      before(async () => {
        await initialize()
        await master.index.track([path.join('test', 'fixtures')])
        await master.snapshot('First snapshot')
        await fixtures.files.modify()
        await fixtures.directories.delete()
      })

      after(async () => {
        await clean()
      })

      it('it should reject with error E_ENTRY_NOT_FOUND_IN_SNAPSHOT', () => {
        return master.revert(0, [path.join('test', 'fixtures', 'test1.md')]).should.be.rejectedWith('E_ENTRY_NOT_FOUND_IN_SNAPSHOT')
      })
    })
  })

  describe('#status', () => {
    let status

    before(async () => {
      await initialize()
      await master.index.track([path.join('test', 'fixtures', 'dir')])
      await master.snapshot('First snapshot')
      await fixtures.files.modify()
      await fixtures.directories.delete()
    })

    after(async () => {
      await clean()
    })

    it('it should return status', async () => {
      status = await master.status()

      status.should.exist
    })

    it('it should identify untracked files', async () => {
      status.untracked.length.should.equal(1)
      status.untracked[0].should.equal('test.md')
    })

    it('it should identify modified files', async () => {
      status.modified.length.should.equal(1)
      status.modified[0].should.equal(path.join('dir', 'test_1.md'))
    })

    it('it should identify deleted files', async () => {
      status.deleted.length.should.equal(1)
      status.deleted[0].should.equal(path.join('dir', 'sub', 'test.md'))
    })
  })
})
