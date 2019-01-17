/* eslint-disable import/no-duplicates */
import Repository from '../lib'
import fs from 'fs-extra'
import path from 'path'
import chai from 'chai'
import { promisify } from 'util'
import capture from 'collect-console'

const expect = chai.expect
const should = chai.should()

let cids = { origin: {}, modified: {}, deleted: {} }

cids.origin['test.md'] = 'QmShBmhvEZ1dDwPvLvpjimRW76AQrVz3fbpZYwsqNJN2Xh'
cids.origin[path.join('dir', 'test_1.md')] = 'Qmaij6pBZtRmVf6sUUaJ4rRkwkF78aqT38GP1YSZho7yLY'
cids.origin[path.join('dir', 'test_2.md')] = 'Qme4pabV5DApSeHsuWu6gXa3EyUj58N85hdMfdD7372rnV'
cids.origin[path.join('dir', 'sub', 'test.md')] = 'QmfHhdmitp8duYj8fsvDTkeRWd5szP7qnS4qEC8oCt37Hr'

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

import { fixtures } from '@pando/helpers/fixtures'

// const fixtures = {
//   files: {
//     modify: () => {
//       fs.writeFileSync(path.join('test', 'fixtures', 'test.md'), 'modified test file\n', 'utf8')
//       fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'test_1.md'), 'modified dir test file 1\n', 'utf8')
//       fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'), 'modified sub test file\n', 'utf8')
//     },
//
//     delete: () => {
//       fs.removeSync(path.join('test', 'fixtures', 'test.md'))
//       // fs.removeSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'))
//     },
//   },
//
//   directories: {
//     delete: () => {
//       fs.removeSync(path.join('test', 'fixtures', 'dir', 'sub'))
//     },
//   },
//
//   restore: () => {
//     fs.ensureDirSync(path.join('test', 'fixtures', 'dir'))
//     fs.ensureDirSync(path.join('test', 'fixtures', 'dir', 'sub'))
//     fs.writeFileSync(path.join('test', 'fixtures', 'test.md'), 'test file\n', 'utf8')
//     fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'test_1.md'), 'dir test file 1\n', 'utf8')
//     fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'test_2.md'), 'dir test file 2\n', 'utf8')
//     fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'), 'sub test file\n', 'utf8')
//   },
// }

describe('@pando/index', () => {
  let repo, master, index

  const init = async () => {
    repo = await Repository.create(path.join('test', 'fixtures'))
    master = await repo.fibers.load('master')
    index = master.index
  }

  const clean = async () => {
    const reset = capture.log()

    await repo.node.start()
    await repo.node.stop()

    reset()

    await repo.remove()
    await fixtures.restore()
  }

  describe('#track', () => {
    describe('file exists in wdir', () => {
      it("it should update file's status to tracked", async () => {})
    })

    describe('file does not exist in wdir', () => {
      describe('but file exists in last snapshot', () => {
        it("it should update file's status to tracked", async () => {})
      })

      describe('and file does not exist in last snapshot', () => {
        it('it should throw', async () => {})
      })
    })
  })

  describe('#untrack', () => {
    describe('file exists in wdir', () => {
      it("it should update file's status to untracked", async () => {})
    })

    describe('file does not exist in wdir', () => {
      describe('but file exists in last snapshot', () => {
        it("it should update file's status to untracked", async () => {})
      })

      describe('and file does not exist in last snapshot', () => {
        it('it should throw', async () => {})
      })
    })
  })

  describe('#status', () => {
    // NOTE: already tested in index.spec.js
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
        two.should.equal(cids.modified['dir/test_1.md'])
        three.should.equal(cids.modified['dir/test_2.md'])
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

      it('it should reject with error E_SNAPSHOT_NOT_FOUND', () => {
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
    describe('unsnapshot', () => {
      describe('and untracked files', () => {
        describe('have been added', () => {
          let result, indexed, untracked, modified, deleted

          before(async () => {
            await init()
          })

          after(async () => {
            await clean()
          })

          it('it should return updated index', async () => {
            const result = await index.status()

            indexed = result.index
            untracked = result.untracked
            modified = result.modified
            deleted = result.deleted

            indexed[paths['test.md']].tracked.should.equal(false)
            indexed[paths['dir/test_1.md']].tracked.should.equal(false)
            indexed[paths['dir/test_2.md']].tracked.should.equal(false)
            indexed[paths['dir/sub/test.md']].tracked.should.equal(false)

            indexed[paths['test.md']].wdir.should.equal(cids.origin[paths['test.md']])
            indexed[paths['dir/test_1.md']].wdir.should.equal(cids.origin[paths['dir/test_1.md']])
            indexed[paths['dir/test_2.md']].wdir.should.equal(cids.origin[paths['dir/test_2.md']])
            indexed[paths['dir/sub/test.md']].wdir.should.equal(cids.origin[paths['dir/sub/test.md']])

            indexed[paths['test.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_1.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_2.md']].snapshot.should.equal('null')
            indexed[paths['dir/sub/test.md']].snapshot.should.equal('null')
          })

          it('it should return untracked files', async () => {
            untracked.length.should.equal(4)
            untracked.indexOf(paths['test.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_1.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_2.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/sub/test.md']).should.be.at.least(0)
          })

          it('it should return modified files', async () => {
            modified.length.should.equal(0)
          })

          it('it should return deleted files', async () => {
            deleted.length.should.equal(0)
          })

          it('it should update index', async () => {
            const current = await index.current()

            current[paths['test.md']].tracked.should.equal(false)
            current[paths['dir/test_1.md']].tracked.should.equal(false)
            current[paths['dir/test_2.md']].tracked.should.equal(false)
            current[paths['dir/sub/test.md']].tracked.should.equal(false)

            current[paths['test.md']].wdir.should.equal(cids.origin[paths['test.md']])
            current[paths['dir/test_1.md']].wdir.should.equal(cids.origin[paths['dir/test_1.md']])
            current[paths['dir/test_2.md']].wdir.should.equal(cids.origin[paths['dir/test_2.md']])
            current[paths['dir/sub/test.md']].wdir.should.equal(cids.origin[paths['dir/sub/test.md']])

            current[paths['test.md']].snapshot.should.equal('null')
            current[paths['dir/test_1.md']].snapshot.should.equal('null')
            current[paths['dir/test_2.md']].snapshot.should.equal('null')
            current[paths['dir/sub/test.md']].snapshot.should.equal('null')
          })
        })

        describe('have been modified', () => {
          let result, indexed, untracked, modified, deleted

          before(async () => {
            // repo  = await Repository.create(path.join('test', 'fixtures'))
            // index = await Index.create(repo)

            await init()

            await index.status()
            await fixtures.files.modify()
          })

          after(async () => {
            await clean()
          })

          it('it should return updated index', async () => {
            const result = await index.status()

            indexed = result.index
            untracked = result.untracked
            modified = result.modified
            deleted = result.deleted

            indexed[paths['test.md']].tracked.should.equal(false)
            indexed[paths['dir/test_1.md']].tracked.should.equal(false)
            indexed[paths['dir/test_2.md']].tracked.should.equal(false)
            indexed[paths['dir/sub/test.md']].tracked.should.equal(false)

            indexed[paths['test.md']].wdir.should.equal(cids.modified[paths['test.md']])
            indexed[paths['dir/test_1.md']].wdir.should.equal(cids.modified[paths['dir/test_1.md']])
            indexed[paths['dir/test_2.md']].wdir.should.equal(cids.modified[paths['dir/test_2.md']])
            indexed[paths['dir/sub/test.md']].wdir.should.equal(cids.modified[paths['dir/sub/test.md']])

            indexed[paths['test.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_1.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_2.md']].snapshot.should.equal('null')
            indexed[paths['dir/sub/test.md']].snapshot.should.equal('null')
          })

          it('it should return untracked files', async () => {
            untracked.length.should.equal(4)
            untracked.indexOf(paths['test.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_1.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_2.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/sub/test.md']).should.be.at.least(0)
          })

          it('it should return modified files', async () => {
            modified.length.should.equal(0)
          })

          it('it should return deleted files', async () => {
            deleted.length.should.equal(0)
          })

          it('it should update index', async () => {
            const current = await index.current()

            current[paths['test.md']].tracked.should.equal(false)
            current[paths['dir/test_1.md']].tracked.should.equal(false)
            current[paths['dir/test_2.md']].tracked.should.equal(false)
            current[paths['dir/sub/test.md']].tracked.should.equal(false)

            current[paths['test.md']].wdir.should.equal(cids.modified[paths['test.md']])
            current[paths['dir/test_1.md']].wdir.should.equal(cids.modified[paths['dir/test_1.md']])
            current[paths['dir/test_2.md']].wdir.should.equal(cids.modified[paths['dir/test_2.md']])
            current[paths['dir/sub/test.md']].wdir.should.equal(cids.modified[paths['dir/sub/test.md']])

            current[paths['test.md']].snapshot.should.equal('null')
            current[paths['dir/test_1.md']].snapshot.should.equal('null')
            current[paths['dir/test_2.md']].snapshot.should.equal('null')
            current[paths['dir/sub/test.md']].snapshot.should.equal('null')
          })
        })

        describe('have been deleted', () => {
          let result, indexed, untracked, modified, deleted

          before(async () => {
            await init()

            await index.status()
            await fixtures.files.delete()
            await fixtures.directories.delete()
          })

          after(async () => {
            await clean()
          })

          it('it should return updated index', async () => {
            const result = await index.status()

            indexed = result.index
            untracked = result.untracked
            modified = result.modified
            deleted = result.deleted

            expect(indexed[paths['test.md']]).to.not.exist
            expect(indexed[paths['dir/sub/test.md']]).to.not.exist

            indexed[paths['dir/test_1.md']].tracked.should.equal(false)
            indexed[paths['dir/test_2.md']].tracked.should.equal(false)

            indexed[paths['dir/test_1.md']].wdir.should.equal(cids.deleted[paths['dir/test_1.md']])
            indexed[paths['dir/test_2.md']].wdir.should.equal(cids.deleted[paths['dir/test_2.md']])

            indexed[paths['dir/test_1.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_2.md']].snapshot.should.equal('null')
          })

          it('it should return untracked files', async () => {
            untracked.length.should.equal(2)
            untracked.indexOf(paths['test.md']).should.be.below(0)
            untracked.indexOf(paths['dir/test_1.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_2.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/sub/test.md']).should.be.below(0)
          })

          it('it should return modified files', async () => {
            modified.length.should.equal(0)
          })

          it('it should return deleted files', async () => {
            deleted.length.should.equal(0)
          })

          it('it should update index', async () => {
            const current = await index.current()

            expect(current[paths['test.md']]).to.not.exist
            expect(current[paths['dir/sub/test.md']]).to.not.exist

            current[paths['dir/test_1.md']].tracked.should.equal(false)
            current[paths['dir/test_2.md']].tracked.should.equal(false)

            current[paths['dir/test_1.md']].wdir.should.equal(cids.deleted[paths['dir/test_1.md']])
            current[paths['dir/test_2.md']].wdir.should.equal(cids.deleted[paths['dir/test_2.md']])

            current[paths['dir/test_1.md']].snapshot.should.equal('null')
            current[paths['dir/test_2.md']].snapshot.should.equal('null')
          })
        })
      })

      describe('and tracked files', () => {
        describe('have been added', () => {
          let result, indexed, untracked, modified, deleted

          before(async () => {
            // repo  = await Repository.create(path.join('test', 'fixtures'))
            // index = await Index.create(repo)
            await init()

            await index.track([path.join('test', 'fixtures', 'test.md'), path.join('test', 'fixtures', 'dir', 'sub', 'test.md')])
          })

          after(async () => {
            await clean()
          })

          it('it should return updated index', async () => {
            const result = await index.status()

            indexed = result.index
            untracked = result.untracked
            modified = result.modified
            deleted = result.deleted

            indexed[paths['test.md']].tracked.should.equal(true)
            indexed[paths['dir/test_1.md']].tracked.should.equal(false)
            indexed[paths['dir/test_2.md']].tracked.should.equal(false)
            indexed[paths['dir/sub/test.md']].tracked.should.equal(true)

            indexed[paths['test.md']].wdir.should.equal(cids.origin[paths['test.md']])
            indexed[paths['dir/test_1.md']].wdir.should.equal(cids.origin[paths['dir/test_1.md']])
            indexed[paths['dir/test_2.md']].wdir.should.equal(cids.origin[paths['dir/test_2.md']])
            indexed[paths['dir/sub/test.md']].wdir.should.equal(cids.origin[paths['dir/sub/test.md']])

            indexed[paths['test.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_1.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_2.md']].snapshot.should.equal('null')
            indexed[paths['dir/sub/test.md']].snapshot.should.equal('null')
          })

          it('it should return untracked files', async () => {
            untracked.length.should.equal(2)
            untracked.indexOf(paths['dir/test_1.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_2.md']).should.be.at.least(0)
          })

          it('it should return modified files', async () => {
            modified.length.should.equal(2)
            modified.indexOf(paths['test.md']).should.be.at.least(0)
            modified.indexOf(paths['dir/sub/test.md']).should.be.at.least(0)
          })

          it('it should return deleted files', async () => {
            deleted.length.should.equal(0)
          })

          it('it should update index', async () => {
            const current = await index.current()

            current[paths['test.md']].tracked.should.equal(true)
            current[paths['dir/test_1.md']].tracked.should.equal(false)
            current[paths['dir/test_2.md']].tracked.should.equal(false)
            current[paths['dir/sub/test.md']].tracked.should.equal(true)

            current[paths['test.md']].wdir.should.equal(cids.origin[paths['test.md']])
            current[paths['dir/test_1.md']].wdir.should.equal(cids.origin[paths['dir/test_1.md']])
            current[paths['dir/test_2.md']].wdir.should.equal(cids.origin[paths['dir/test_2.md']])
            current[paths['dir/sub/test.md']].wdir.should.equal(cids.origin[paths['dir/sub/test.md']])

            current[paths['test.md']].snapshot.should.equal('null')
            current[paths['dir/test_1.md']].snapshot.should.equal('null')
            current[paths['dir/test_2.md']].snapshot.should.equal('null')
            current[paths['dir/sub/test.md']].snapshot.should.equal('null')
          })
        })

        describe('have been modified', () => {
          let result, indexed, untracked, modified, deleted

          before(async () => {
            // repo  = await Repository.create(path.join('test', 'fixtures'))
            // index = await Index.create(repo)

            await init()

            await index.track([path.join('test', 'fixtures', 'test.md'), path.join('test', 'fixtures', 'dir', 'sub', 'test.md')])
            await index.status()
            await fixtures.files.modify()
          })

          after(async () => {
            await clean()
          })

          it('it should return updated index', async () => {
            const result = await index.status()

            indexed = result.index
            untracked = result.untracked
            modified = result.modified
            deleted = result.deleted

            indexed[paths['test.md']].tracked.should.equal(true)
            indexed[paths['dir/test_1.md']].tracked.should.equal(false)
            indexed[paths['dir/test_2.md']].tracked.should.equal(false)
            indexed[paths['dir/sub/test.md']].tracked.should.equal(true)

            indexed[paths['test.md']].wdir.should.equal(cids.modified[paths['test.md']])
            indexed[paths['dir/test_1.md']].wdir.should.equal(cids.modified[paths['dir/test_1.md']])
            indexed[paths['dir/test_2.md']].wdir.should.equal(cids.modified[paths['dir/test_2.md']])
            indexed[paths['dir/sub/test.md']].wdir.should.equal(cids.modified[paths['dir/sub/test.md']])

            indexed[paths['test.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_1.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_2.md']].snapshot.should.equal('null')
            indexed[paths['dir/sub/test.md']].snapshot.should.equal('null')
          })

          it('it should return untracked files', async () => {
            untracked.length.should.equal(2)
            untracked.indexOf(paths['dir/test_1.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_2.md']).should.be.at.least(0)
          })

          it('it should return modified files', async () => {
            modified.length.should.equal(2)
            modified.indexOf(paths['test.md']).should.be.at.least(0)
            modified.indexOf(paths['dir/sub/test.md']).should.be.at.least(0)
          })

          it('it should return deleted files', async () => {
            deleted.length.should.equal(0)
          })

          it('it should update index', async () => {
            const current = await index.current()

            current[paths['test.md']].tracked.should.equal(true)
            current[paths['dir/test_1.md']].tracked.should.equal(false)
            current[paths['dir/test_2.md']].tracked.should.equal(false)
            current[paths['dir/sub/test.md']].tracked.should.equal(true)

            current[paths['test.md']].wdir.should.equal(cids.modified[paths['test.md']])
            current[paths['dir/test_1.md']].wdir.should.equal(cids.modified[paths['dir/test_1.md']])
            current[paths['dir/test_2.md']].wdir.should.equal(cids.modified[paths['dir/test_2.md']])
            current[paths['dir/sub/test.md']].wdir.should.equal(cids.modified[paths['dir/sub/test.md']])

            current[paths['test.md']].snapshot.should.equal('null')
            current[paths['dir/test_1.md']].snapshot.should.equal('null')
            current[paths['dir/test_2.md']].snapshot.should.equal('null')
            current[paths['dir/sub/test.md']].snapshot.should.equal('null')
          })
        })

        describe('have been deleted', () => {
          let result, indexed, untracked, modified, deleted

          before(async () => {
            // repo  = await Repository.create(path.join('test', 'fixtures'))
            // index = await Index.create(repo)

            await init()

            await index.track([path.join('test', 'fixtures', 'test.md'), path.join('test', 'fixtures', 'dir', 'sub', 'test.md')])
            await index.status()
            await fixtures.files.delete()
            await fixtures.directories.delete()
          })

          after(async () => {
            await clean()
          })

          it('it should return updated index', async () => {
            const result = await index.status()

            indexed = result.index
            untracked = result.untracked
            modified = result.modified
            deleted = result.deleted

            expect(indexed[paths['test.md']]).to.not.exist
            expect(indexed[paths['dir/sub/test.md']]).to.not.exist

            indexed[paths['dir/test_1.md']].tracked.should.equal(false)
            indexed[paths['dir/test_2.md']].tracked.should.equal(false)

            indexed[paths['dir/test_1.md']].wdir.should.equal(cids.deleted[paths['dir/test_1.md']])
            indexed[paths['dir/test_2.md']].wdir.should.equal(cids.deleted[paths['dir/test_2.md']])

            indexed[paths['dir/test_1.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_2.md']].snapshot.should.equal('null')
          })

          it('it should return untracked files', async () => {
            untracked.length.should.equal(2)
            untracked.indexOf(paths['dir/test_1.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_2.md']).should.be.at.least(0)
          })

          it('it should return modified files', async () => {
            modified.length.should.equal(0)
          })

          it('it should return deleted files', async () => {
            deleted.length.should.equal(0)
          })

          it('it should update index', async () => {
            const current = await index.current()

            expect(current[paths['test.md']]).to.not.exist
            expect(current[paths['dir/sub/test.md']]).to.not.exist

            current[paths['dir/test_1.md']].tracked.should.equal(false)
            current[paths['dir/test_2.md']].tracked.should.equal(false)

            current[paths['dir/test_1.md']].wdir.should.equal(cids.deleted[paths['dir/test_1.md']])
            current[paths['dir/test_2.md']].wdir.should.equal(cids.deleted[paths['dir/test_2.md']])

            current[paths['dir/test_1.md']].snapshot.should.equal('null')
            current[paths['dir/test_2.md']].snapshot.should.equal('null')
          })
        })
      })
    })

    describe('snapshot', () => {
      describe('and untracked files', () => {
        describe('have been modified', () => {
          let result, indexed, untracked, modified, deleted

          before(async () => {
            // repo  = await Repository.create(path.join('test', 'fixtures'))
            // index = await Index.create(repo)

            await init()

            await index.track([path.join('test', 'fixtures', 'test.md')])
            await index.snapshot()
            await index.untrack([path.join('test', 'fixtures', 'test.md')])
            await fixtures.files.modify()
          })

          after(async () => {
            await clean()
          })

          it('it should return updated index', async () => {
            const result = await index.status()

            indexed = result.index
            untracked = result.untracked
            modified = result.modified
            deleted = result.deleted

            indexed[paths['test.md']].tracked.should.equal(false)
            indexed[paths['dir/test_1.md']].tracked.should.equal(false)
            indexed[paths['dir/test_2.md']].tracked.should.equal(false)
            indexed[paths['dir/sub/test.md']].tracked.should.equal(false)

            indexed[paths['test.md']].wdir.should.equal(cids.modified[paths['test.md']])
            indexed[paths['dir/test_1.md']].wdir.should.equal(cids.modified[paths['dir/test_1.md']])
            indexed[paths['dir/test_2.md']].wdir.should.equal(cids.modified[paths['dir/test_2.md']])
            indexed[paths['dir/sub/test.md']].wdir.should.equal(cids.modified[paths['dir/sub/test.md']])

            indexed[paths['test.md']].snapshot.should.equal(cids.origin[paths['test.md']])
            indexed[paths['dir/test_1.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_2.md']].snapshot.should.equal('null')
            indexed[paths['dir/sub/test.md']].snapshot.should.equal('null')
          })

          it('it should return untracked files', async () => {
            untracked.length.should.equal(4)
            untracked.indexOf(paths['test.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_1.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_2.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/sub/test.md']).should.be.at.least(0)
          })

          it('it should return modified files', async () => {
            modified.length.should.equal(0)
          })

          it('it should return deleted files', async () => {
            deleted.length.should.equal(0)
          })

          it('it should update index', async () => {
            const current = await index.current()

            current[paths['test.md']].tracked.should.equal(false)
            current[paths['dir/test_1.md']].tracked.should.equal(false)
            current[paths['dir/test_2.md']].tracked.should.equal(false)
            current[paths['dir/sub/test.md']].tracked.should.equal(false)

            current[paths['test.md']].wdir.should.equal(cids.modified[paths['test.md']])
            current[paths['dir/test_1.md']].wdir.should.equal(cids.modified[paths['dir/test_1.md']])
            current[paths['dir/test_2.md']].wdir.should.equal(cids.modified[paths['dir/test_2.md']])
            current[paths['dir/sub/test.md']].wdir.should.equal(cids.modified[paths['dir/sub/test.md']])

            current[paths['test.md']].snapshot.should.equal(cids.origin[paths['test.md']])
            current[paths['dir/test_1.md']].snapshot.should.equal('null')
            current[paths['dir/test_2.md']].snapshot.should.equal('null')
            current[paths['dir/sub/test.md']].snapshot.should.equal('null')
          })
        })

        describe('have been deleted', () => {
          let result, indexed, untracked, modified, deleted

          before(async () => {
            // repo  = await Repository.create(path.join('test', 'fixtures'))
            // index = await Index.create(repo)
            await init()

            await index.track([path.join('test', 'fixtures', 'test.md'), path.join('test', 'fixtures', 'dir', 'sub', 'test.md')])
            await index.snapshot()
            await index.untrack([path.join('test', 'fixtures', 'test.md'), path.join('test', 'fixtures', 'dir', 'sub', 'test.md')])
            await fixtures.files.delete()
            await fixtures.directories.delete()
          })

          after(async () => {
            await clean()
          })

          it('it should return updated index', async () => {
            const result = await index.status()

            indexed = result.index
            untracked = result.untracked
            modified = result.modified
            deleted = result.deleted

            indexed[paths['test.md']].tracked.should.equal(false)
            indexed[paths['dir/test_1.md']].tracked.should.equal(false)
            indexed[paths['dir/test_2.md']].tracked.should.equal(false)
            indexed[paths['dir/sub/test.md']].tracked.should.equal(false)

            indexed[paths['test.md']].wdir.should.equal('null')
            indexed[paths['dir/test_1.md']].wdir.should.equal(cids.deleted[paths['dir/test_1.md']])
            indexed[paths['dir/test_2.md']].wdir.should.equal(cids.deleted[paths['dir/test_2.md']])
            indexed[paths['dir/sub/test.md']].wdir.should.equal('null')

            indexed[paths['test.md']].snapshot.should.equal(cids.origin[paths['test.md']])
            indexed[paths['dir/test_1.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_2.md']].snapshot.should.equal('null')
            indexed[paths['dir/sub/test.md']].snapshot.should.equal(cids.origin[paths['dir/sub/test.md']])
          })

          it('it should return untracked files', async () => {
            untracked.length.should.equal(4)
            untracked.indexOf(paths['test.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_1.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_2.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/sub/test.md']).should.be.at.least(0)
          })

          it('it should return modified files', async () => {
            modified.length.should.equal(0)
          })

          it('it should return deleted files', async () => {
            deleted.length.should.equal(0)
          })

          it('it should update index', async () => {
            const current = await index.current()

            current[paths['test.md']].tracked.should.equal(false)
            current[paths['dir/test_1.md']].tracked.should.equal(false)
            current[paths['dir/test_2.md']].tracked.should.equal(false)
            current[paths['dir/sub/test.md']].tracked.should.equal(false)

            current[paths['test.md']].wdir.should.equal('null')
            current[paths['dir/test_1.md']].wdir.should.equal(cids.deleted[paths['dir/test_1.md']])
            current[paths['dir/test_2.md']].wdir.should.equal(cids.deleted[paths['dir/test_2.md']])
            current[paths['dir/sub/test.md']].wdir.should.equal('null')

            current[paths['test.md']].snapshot.should.equal(cids.origin[paths['test.md']])
            current[paths['dir/test_1.md']].snapshot.should.equal('null')
            current[paths['dir/test_2.md']].snapshot.should.equal('null')
            current[paths['dir/sub/test.md']].snapshot.should.equal(cids.origin[paths['dir/sub/test.md']])
          })
        })
      })

      describe('and tracked files', () => {
        describe('have been modified', () => {
          let result, indexed, untracked, modified, deleted

          before(async () => {
            // repo  = await Repository.create(path.join('test', 'fixtures'))
            // index = await Index.create(repo)
            await init()

            await index.track([path.join('test', 'fixtures', 'test.md'), path.join('test', 'fixtures', 'dir', 'sub', 'test.md')])
            await index.snapshot()
            await fixtures.files.modify()
          })

          after(async () => {
            await clean()
          })

          it('it should return updated index', async () => {
            const result = await index.status()

            indexed = result.index
            untracked = result.untracked
            modified = result.modified
            deleted = result.deleted

            indexed[paths['test.md']].tracked.should.equal(true)
            indexed[paths['dir/test_1.md']].tracked.should.equal(false)
            indexed[paths['dir/test_2.md']].tracked.should.equal(false)
            indexed[paths['dir/sub/test.md']].tracked.should.equal(true)

            indexed[paths['test.md']].wdir.should.equal(cids.modified[paths['test.md']])
            indexed[paths['dir/test_1.md']].wdir.should.equal(cids.modified[paths['dir/test_1.md']])
            indexed[paths['dir/test_2.md']].wdir.should.equal(cids.modified[paths['dir/test_2.md']])
            indexed[paths['dir/sub/test.md']].wdir.should.equal(cids.modified[paths['dir/sub/test.md']])

            indexed[paths['test.md']].snapshot.should.equal(cids.origin[paths['test.md']])
            indexed[paths['dir/test_1.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_2.md']].snapshot.should.equal('null')
            indexed[paths['dir/sub/test.md']].snapshot.should.equal(cids.origin[paths['dir/sub/test.md']])
          })

          it('it should return untracked files', async () => {
            untracked.length.should.equal(2)
            untracked.indexOf(paths['dir/test_1.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_2.md']).should.be.at.least(0)
          })

          it('it should return modified files', async () => {
            modified.length.should.equal(2)
            modified.indexOf(paths['test.md']).should.be.at.least(0)
            modified.indexOf(paths['dir/sub/test.md']).should.be.at.least(0)
          })

          it('it should return deleted files', async () => {
            deleted.length.should.equal(0)
          })

          it('it should update index', async () => {
            const current = await index.current()

            current[paths['test.md']].tracked.should.equal(true)
            current[paths['dir/test_1.md']].tracked.should.equal(false)
            current[paths['dir/test_2.md']].tracked.should.equal(false)
            current[paths['dir/sub/test.md']].tracked.should.equal(true)

            current[paths['test.md']].wdir.should.equal(cids.modified[paths['test.md']])
            current[paths['dir/test_1.md']].wdir.should.equal(cids.modified[paths['dir/test_1.md']])
            current[paths['dir/test_2.md']].wdir.should.equal(cids.modified[paths['dir/test_2.md']])
            current[paths['dir/sub/test.md']].wdir.should.equal(cids.modified[paths['dir/sub/test.md']])

            current[paths['test.md']].snapshot.should.equal(cids.origin[paths['test.md']])
            current[paths['dir/test_1.md']].snapshot.should.equal('null')
            current[paths['dir/test_2.md']].snapshot.should.equal('null')
            current[paths['dir/sub/test.md']].snapshot.should.equal(cids.origin[paths['dir/sub/test.md']])
          })
        })

        describe('have been deleted', () => {
          let result, indexed, untracked, modified, deleted

          before(async () => {
            // repo  = await Repository.create(path.join('test', 'fixtures'))
            // index = await Index.create(repo)

            await init()

            await index.track([path.join('test', 'fixtures', 'test.md'), path.join('test', 'fixtures', 'dir', 'sub', 'test.md')])
            await index.snapshot()
            await fixtures.files.delete()
            await fixtures.directories.delete()
          })

          after(async () => {
            await clean()
          })

          it('it should return updated index', async () => {
            const result = await index.status()

            indexed = result.index
            untracked = result.untracked
            modified = result.modified
            deleted = result.deleted

            indexed[paths['test.md']].tracked.should.equal(true)
            indexed[paths['dir/test_1.md']].tracked.should.equal(false)
            indexed[paths['dir/test_2.md']].tracked.should.equal(false)
            indexed[paths['dir/sub/test.md']].tracked.should.equal(true)

            indexed[paths['test.md']].wdir.should.equal('null')
            indexed[paths['dir/test_1.md']].wdir.should.equal(cids.deleted[paths['dir/test_1.md']])
            indexed[paths['dir/test_2.md']].wdir.should.equal(cids.deleted[paths['dir/test_2.md']])
            indexed[paths['dir/sub/test.md']].wdir.should.equal('null')

            indexed[paths['test.md']].snapshot.should.equal(cids.origin[paths['test.md']])
            indexed[paths['dir/test_1.md']].snapshot.should.equal('null')
            indexed[paths['dir/test_2.md']].snapshot.should.equal('null')
            indexed[paths['dir/sub/test.md']].snapshot.should.equal(cids.origin[paths['dir/sub/test.md']])
          })

          it('it should return untracked files', async () => {
            untracked.length.should.equal(2)
            untracked.indexOf(paths['dir/test_1.md']).should.be.at.least(0)
            untracked.indexOf(paths['dir/test_2.md']).should.be.at.least(0)
          })

          it('it should return modified files', async () => {
            modified.length.should.equal(0)
          })

          it('it should return deleted files', async () => {
            deleted.length.should.equal(2)
            deleted.indexOf(paths['test.md']).should.be.at.least(0)
            deleted.indexOf(paths['dir/sub/test.md']).should.be.at.least(0)
          })

          it('it should update index', async () => {
            const current = await index.current()

            current[paths['test.md']].tracked.should.equal(true)
            current[paths['dir/test_1.md']].tracked.should.equal(false)
            current[paths['dir/test_2.md']].tracked.should.equal(false)
            current[paths['dir/sub/test.md']].tracked.should.equal(true)

            current[paths['test.md']].wdir.should.equal('null')
            current[paths['dir/test_1.md']].wdir.should.equal(cids.deleted[paths['dir/test_1.md']])
            current[paths['dir/test_2.md']].wdir.should.equal(cids.deleted[paths['dir/test_2.md']])
            current[paths['dir/sub/test.md']].wdir.should.equal('null')

            current[paths['test.md']].snapshot.should.equal(cids.origin[paths['test.md']])
            current[paths['dir/test_1.md']].snapshot.should.equal('null')
            current[paths['dir/test_2.md']].snapshot.should.equal('null')
            current[paths['dir/sub/test.md']].snapshot.should.equal(cids.origin[paths['dir/sub/test.md']])
          })
        })
      })
    })
  })
})
