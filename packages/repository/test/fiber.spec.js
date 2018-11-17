/* eslint-disable import/no-duplicates */
import Repository from '../lib/'
import Fiber from '../lib/fiber'
import fs from 'fs-extra'
// import Index from '../lib'
import path from 'path'
import chai from 'chai'
import { promisify } from 'util'
import capture from 'collect-console'


import promised from 'chai-as-promised'

chai.use(promised)

const expect = chai.expect
const should = chai.should()


let cids = { origin: {}, modified: {}, deleted: {}}

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

paths['test.md']         = 'test.md'
paths['dir/test_1.md']   = path.join('dir', 'test_1.md')
paths['dir/test_2.md']   = path.join('dir', 'test_2.md')
paths['dir/sub']         = path.join('dir', 'sub')
paths['dir/sub/test.md'] = path.join('dir', 'sub', 'test.md')



const fixtures = {
    files: {
        modify: () => {
            fs.writeFileSync(path.join('test', 'fixtures', 'test.md'), 'modified test file\n', 'utf8')
            fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'test_1.md'), 'modified dir test file 1\n', 'utf8')
            fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'), 'modified sub test file\n', 'utf8')
        },

        delete: () => {
            fs.removeSync(path.join('test', 'fixtures', 'test.md'))
            // fs.removeSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'))
        }
    },

    directories: {
        delete: () => {
            fs.removeSync(path.join('test', 'fixtures', 'dir', 'sub'))
        }
    },

    restore: () => {
        fs.ensureDirSync(path.join('test', 'fixtures', 'dir'))
        fs.ensureDirSync(path.join('test', 'fixtures', 'dir', 'sub'))
        fs.writeFileSync(path.join('test', 'fixtures', 'test.md'), 'test file\n', 'utf8')
        fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'test_1.md'), 'dir test file 1\n', 'utf8')
        fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'test_2.md'), 'dir test file 2\n', 'utf8')
        fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'), 'sub test file\n', 'utf8')
    }
}




describe('@pando/repository/fibers', () => {
    let repository, master, fiber

    const initialize = async () => {
        repository = await Repository.create(path.join('test', 'fixtures'))
        master     = await repository.fibers.load('master')
    }

    const clean = async () => {
        const reset = capture.log()

        await repository.node.start()
        await repository.node.stop()

        reset()

        await repository.remove()
        await fixtures.restore()
    }

    // describe('static#exists', () => {
    //     before(async () => {
    //         await initialize()
    //     })
    //
    //     after(async () => {
    //         await clean()
    //     })
    //
    //     it('it should return true if fiber exists', async () => {
    //         const exists = await Fiber.exists(repository, master.uuid)
    //
    //         exists.should.be.true
    //     })
    //
    //     it('it should return false if fiber does not exist', async () => {
    //         const exists = await Fiber.exists(repository, 'uuiddoesnotexist')
    //
    //         exists.should.be.false
    //     })
    // })
    //
    // describe('static#create', () => {
    //     before(async () => {
    //         await initialize()
    //     })
    //
    //     it('it should return created fiber', async () => {
    //         fiber = await Fiber.create(repository)
    //
    //         fiber.should.exist
    //     })
    //
    //     it("it should set fiber's repository", async () => {
    //         fiber.repository.should.deep.equal(repository)
    //     })
    //
    //     it("it should set fiber's uuid", async () => {
    //         fiber.uuid.should.exist
    //     })
    //
    //     it("it should set fiber's paths", async () => {
    //         fiber.paths.root.should.equal(path.join(repository.paths.fibers, fiber.uuid))
    //         fiber.paths.index.should.equal(path.join(repository.paths.fibers, fiber.uuid, 'index'))
    //         fiber.paths.snapshots.should.equal(path.join(repository.paths.fibers, fiber.uuid, 'snapshots'))
    //         fiber.paths.stash.should.equal(path.join(repository.paths.fibers, fiber.uuid, 'stash'))
    //     })
    //
    //     it("it should set fiber's index", async () => {
    //         fiber.index.should.exist
    //     })
    //
    //     it("it should set fiber's snapshots", async () => {
    //         fiber.snapshots.should.exist
    //     })
    //
    //     it('it should initialize directory structure', async () => {
    //         let root_exists      = await fs.pathExists(fiber.paths.root)
    //         let index_exists     = await fs.pathExists(fiber.paths.index)
    //         let snapshots_exists = await fs.pathExists(fiber.paths.snapshots)
    //         let stash_exists     = await fs.pathExists(fiber.paths.stash)
    //
    //         root_exists.should.be.true
    //         index_exists.should.be.true
    //         snapshots_exists.should.be.true
    //         stash_exists.should.be.true
    //     })
    //
    //     describe("'open' option is disabled", () => {
    //         before(async () => {
    //             await clean()
    //             await initialize()
    //             fiber = await Fiber.create(repository)
    //         })
    //
    //         after(async () => {
    //             await clean()
    //         })
    //
    //         it("it should close fiber's snapshots database", async () => {
    //             fiber.snapshots.isClosed().should.be.true
    //         })
    //
    //         it("it should close fiber's index database", async () => {
    //             fiber.index.db.isClosed().should.be.true
    //         })
    //     })
    //
    //     describe("'open' option is enabled", () => {
    //         before(async () => {
    //             await initialize()
    //             fiber = await Fiber.create(repository, { open: true })
    //         })
    //
    //         after(async () => {
    //             await clean()
    //         })
    //
    //         it("it should let fiber's snapshots database open", async () => {
    //             fiber.snapshots.isOpen().should.be.true
    //         })
    //
    //         it("it should let fiber's index database open", async () => {
    //             fiber.index.db.isOpen().should.be.true
    //         })
    //     })
    // })
    //
    // describe('static#load', () => {
    //     describe('fiber exists', () => {
    //         before(async () => {
    //             await initialize()
    //         })
    //
    //         after(async () => {
    //             await clean()
    //         })
    //
    //         it('it should return loaded fiber', async () => {
    //             let created = await Fiber.create(repository)
    //             fiber = await Fiber.load(repository, created.uuid)
    //
    //             fiber.should.exist
    //         })
    //
    //         it("it should set fiber's repository", async () => {
    //             fiber.repository.should.deep.equal(repository)
    //         })
    //
    //         it("it should set fiber's uuid", async () => {
    //             fiber.uuid.should.exist
    //         })
    //
    //         it("it should set fiber's paths", async () => {
    //             fiber.paths.root.should.equal(path.join(repository.paths.fibers, fiber.uuid))
    //             fiber.paths.index.should.equal(path.join(repository.paths.fibers, fiber.uuid, 'index'))
    //             fiber.paths.snapshots.should.equal(path.join(repository.paths.fibers, fiber.uuid, 'snapshots'))
    //             fiber.paths.stash.should.equal(path.join(repository.paths.fibers, fiber.uuid, 'stash'))
    //         })
    //
    //         it("it should set fiber's index", async () => {
    //             fiber.index.should.exist
    //         })
    //
    //         it("it should set fiber's snapshots", async () => {
    //             fiber.snapshots.should.exist
    //         })
    //
    //         it("it should open fiber's snapshots database", async () => {
    //             fiber.snapshots.isOpen().should.be.true
    //         })
    //
    //         it("it should open fiber's index database", async () => {
    //             fiber.index.db.isOpen().should.be.true
    //         })
    //     })
    //
    //     describe('fiber does not exist', () => {
    //         before(async () => {
    //             await initialize()
    //         })
    //
    //         after(async () => {
    //             await clean()
    //         })
    //
    //         it('it should reject with error E_FIBER_NOT_FOUND', async () => {
    //             return Fiber.load(repository, 'uuiddoesnotexist').should.be.rejectedWith('E_FIBER_NOT_FOUND')
    //         })
    //     })
    // })
    //
    // describe('#status', () => {
    //     // NOTE: already tested in index.spec.js
    // })
    //
    // describe('#snapshot', () => {
    //     let snapshot
    //
    //     before(async () => {
    //         await initialize()
    //         await master.index.track([path.join('test', 'fixtures')])
    //         await master.snapshot('First snapshot')
    //         await fixtures.files.modify()
    //     })
    //
    //     after(async () => {
    //         await clean()
    //     })
    //
    //     it('it should return created snapshot', async () => {
    //         snapshot = await master.snapshot('Second snapshot')
    //
    //         snapshot.should.exist
    //     })
    //
    //     it("it should set snapshot's id", async () => {
    //         snapshot.id.should.equal(1)
    //     })
    //
    //     it("it should set snapshot's timestamp", async () => {
    //         snapshot.timestamp.should.exist
    //     })
    //
    //     it("it should set snapshot's message", async () => {
    //         snapshot.message.should.equal('Second snapshot')
    //     })
    //
    //     it("it should set snapshot's tree hash", async () => {
    //         snapshot.tree.should.equal(cids.modified['tree'])
    //     })
    //
    //     it("it should update snapshot's database", async () => {
    //         let length = await master._length()
    //         length.should.equal(2)
    //     })
    // })
    //
    // describe('#log', () => {
    //     let log
    //
    //     before(async () => {
    //         await initialize()
    //         await master.index.track([path.join('test', 'fixtures')])
    //         await master.snapshot('First snapshot')
    //         await fixtures.files.modify()
    //         await master.snapshot('Second snapshot')
    //     })
    //
    //     after(async () => {
    //         await clean()
    //     })
    //
    //     it('it should return snapshots history', async () => {
    //         log = await master.log()
    //
    //         log.should.exist
    //         log.length.should.equal(2)
    //     })
    //
    //     it("it should return each snapshot's id", async () => {
    //         log[0].id.should.equal(1)
    //         log[1].id.should.equal(0)
    //     })
    //
    //     it("it should return each snapshot's timestamp", async () => {
    //         log[0].timestamp.should.exist
    //         log[1].timestamp.should.exist
    //     })
    //
    //     it("it should return each snapshot's message", async () => {
    //         log[0].message.should.equal('Second snapshot')
    //         log[1].message.should.equal('First snapshot')
    //     })
    //
    //     it("it should return each snapshot's tree hash", async () => {
    //         log[0].tree.should.equal(cids.modified['tree'])
    //         log[1].tree.should.equal(cids.origin['tree'])
    //     })
    //
    //     describe('limit parameter is passed', () => {
    //         it('it should return #limit last snapshots', async () => {
    //             log = await master.log({ limit: 1 })
    //
    //             log.should.exist
    //             log.length.should.equal(1)
    //             log[0].id.should.equal(1)
    //         })
    //     })
    // })

    describe('#revert', () => {
        describe('snapshot exists and all entries exists in snapshots', () => {
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

            it('it should fulfill', async () => {
                await master.revert(0, [path.join('test', 'fixtures', 'test.md'), path.join('test', 'fixtures', 'dir', 'sub')])
            })


            it('it should create a backup snapshot', async () => {

            })

            it("it should revert entries back to snapshot's version", async () => {

                (await master.index.cid('test.md')).should.equal(cids.origin['test.md'])
                // (await master.index.cid('test.md')).should.equal(cids.origin['test.md'])

            })


        })
    })

    // describe('#factory', () => {
    //
    //     describe('#uuid', () => {
    //         describe('fiber exists', () => {
    //             before(async () => {
    //                 await initialize()
    //
    //
    //             })
    //
    //             after(async () => {
    //                 await clean()
    //             })
    //
    //             it("it should return fiber's uuid", async () => {
    //                 let uuid = await repository.fibers.uuid('master')
    //
    //                 uuid.should.equal(master.uuid)
    //             })
    //         })
    //
    //         describe("fiber does not exist", () => {
    //             before(async () => {
    //                 repository = await Repository.create(path.join('test', 'fixtures'))
    //             })
    //
    //             after(async () => {
    //                 await clean()
    //             })
    //
    //             it('it should throw', async () => {
    //                 return repository.fibers.uuid('donotexist').should.be.rejected
    //             })
    //         })
    //     })
    //
    //     describe('#current', () => {
    //         describe('uuid option is disabled', () => {
    //             before(async () => {
    //                 repository = await Repository.create(path.join('test', 'fixtures'))
    //                 fiber      = await repository.fibers.create('dev')
    //
    //                 await repository.fibers.switch('dev')
    //             })
    //
    //             after(async () => {
    //                 await clean()
    //             })
    //
    //             it('it should return current fiber', async () => {
    //                 let current = await repository.fibers.current()
    //
    //                 current.uuid.should.equal(fiber.uuid)
    //             })
    //         })
    //
    //         describe('uuid option is enabled', () => {
    //             before(async () => {
    //                 repository = await Repository.create(path.join('test', 'fixtures'))
    //                 fiber      = await repository.fibers.create('dev')
    //
    //                 await repository.fibers.switch('dev')
    //             })
    //
    //             after(async () => {
    //                 await clean()
    //             })
    //
    //             it("it should return current fiber's uuid", async () => {
    //                 let uuid = await repository.fibers.current({ uuid: true })
    //
    //                 uuid.should.equal(fiber.uuid)
    //             })
    //         })
    //     })
    //
    //     describe('#create', () => {
    //         describe('fiber does not exist', () => {
    //             describe('and fork option is enabled', () => {
    //                 let snapshots
    //
    //                 describe('and open option is enabled', () => {
    //                     before(async () => {
    //                         repository = await Repository.create(path.join('test', 'fixtures'))
    //                         master     = await repository.fibers.load('master')
    //                         await master.snapshot()
    //                         snapshots  = await master.log()
    //                     })
    //
    //                     after(async () => {
    //                         await clean()
    //                     })
    //
    //                     it('it should initialize fiber', async () => {
    //                         fiber = await repository.fibers.create('dev', { fork: true, open: true })
    //
    //                         fiber.uuid.should.exist
    //                         fiber.index.should.exist
    //                         fiber.snapshots.should.exist
    //                         fiber.repository.should.deep.equal(repository)
    //                         fiber.paths.root.should.equal(path.join(repository.paths.fibers, fiber.uuid))
    //                         fiber.paths.index.should.equal(path.join(repository.paths.fibers, fiber.uuid, 'index'))
    //                         fiber.paths.snapshots.should.equal(path.join(repository.paths.fibers, fiber.uuid, 'snapshots'))
    //                     })
    //
    //                     it("it should initialize fiber's directory structure", async () => {
    //                         fs.pathExistsSync(path.join(repository.paths.fibers, fiber.uuid)).should.equal(true)
    //                         fs.pathExistsSync(path.join(repository.paths.fibers, fiber.uuid, 'stash')).should.equal(true)
    //                     })
    //
    //                     it("it should fork current's fiber snapshot history", async () => {
    //                         const snaps = await fiber.log()
    //
    //                         snaps.should.deep.equal(snapshots)
    //                     })
    //
    //                     it("it should open fiber's index and snapshots databases", async () => {
    //                         fiber.index.db.isOpen().should.equal(true)
    //                         fiber.snapshots.isOpen().should.equal(true)
    //                     })
    //
    //                     it('it should stash fiber for further use', async () => {
    //
    //                     })
    //
    //                 })
    //
    //             })
    //
    //             describe('and fork option is disabled', () => {
    //                 before(async () => {
    //                     repository = await Repository.create(path.join('test', 'fixtures'))
    //                 })
    //
    //                 after(async () => {
    //                     await clean()
    //                 })
    //
    //                 it('it should initialize fiber', async () => {
    //
    //                     fiber = await repository.fibers.create('dev')
    //
    //                     fiber.repository.should.deep.equal(repository)
    //
    //                 })
    //
    //                 it('it should initialize fiber', async () => {})
    //             })
    //         })
    //
    //         describe('fiber already exists', () => {
    //
    //
    //             it('it should throw ', async () => {
    //
    //
    //             })
    //
    //         })
    //     })
    //
    //     // describe('#load', () => {})
    //     //
    //     // describe('#switch', () => {})
    //
    //     // describe('#current', () => {
    //     //     describe('there is a current fiber', () => {
    //     //         let fiber_1, fiber_2, current
    //     //
    //     //         before(async () => {
    //     //             repository = await Repository.create(path.join('test', 'fixtures'))
    //     //             fiber_1    = await repository.fibers.create('fiber_1')
    //     //             fiber_2    = await repository.fibers.create('fiber_2')
    //     //         })
    //     //
    //     //         after(async () => {
    //     //             await clean()
    //     //         })
    //     //
    //     //         it('it should return current fiber', async () => {
    //     //             console.log('Switch one')
    //     //             await repository.fibers.switch('fiber_1')
    //     //             current = await repository.fibers.current({ uuid: true })
    //     //             current.should.equal(fiber_1.uuid)
    //     //             console.log('Switch two')
    //     //
    //     //             await repository.fibers.switch('fiber_2')
    //     //             current = await repository.fibers.current({ uuid: true })
    //     //             current.should.equal(fiber_2.uuid)
    //     //
    //     //             console.log('Switch three')
    //     //
    //     //             await repository.fibers.switch('master')
    //     //         })
    //     //     })
    //     // })
    //
    //     describe('#log', () => {})
    //
    //     describe('#rename', () => {})
    // })
})
