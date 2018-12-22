/* eslint-disable import/no-duplicates */
import Pando from '../../lib'
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

paths['test.md']         = 'test.md'
paths['dir/test_1.md']   = path.join('dir', 'test_1.md')
paths['dir/test_2.md']   = path.join('dir', 'test_2.md')
paths['dir/sub']         = path.join('dir', 'sub')
paths['dir/sub/test.md'] = path.join('dir', 'sub', 'test.md')

const account = '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7'
const gateway = { fake: { protocol: 'ws', host: '192.168.0.1', port: '8546' } }
const options = { ethereum: { account: account }}


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

describe('pando/plant', () => {
    let pando, plant, master

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

    describe('#fibers', () => {
        describe('#uuid', () => {
            describe('fiber exists', () => {
                before(async () => {
                  await initialize()
                    // pando = await Pando.create(options)
                    // plant = await pando.plants.create(path.join('test', 'fixtures'))
                    // master = await plant.fibers.load('master')
                })

                after(async () => {
                    await clean()
                })

                it("it should return fiber's uuid", async () => {
                    let uuid = await plant.fibers.uuid('master')

                    uuid.should.equal(master.uuid)
                })
            })

            describe("fiber does not exist", () => {
                before(async () => {
                    // repository = await Repository.create(path.join('test', 'fixtures'))
                    await initialize()
                })

                after(async () => {
                    await clean()
                })

                it('it should throw', async () => {
                    return plant.fibers.uuid('donotexist').should.be.rejected
                })
            })
        })

        describe('#current', () => {
          let fiber

            describe('uuid option is disabled', () => {
                before(async () => {
                  await initialize()

                  fiber = await plant.fibers.create('dev')
                  // await plant.fibers.switch('dev')

                })

                after(async () => {
                    await clean()
                })

                it('it should return current fiber', async () => {
                    // let current = await plant.fibers.current()
                    //
                    // current.uuid.should.equal(fiber.uuid)
                })
            })

            // describe('uuid option is enabled', () => {
            //     before(async () => {
            //         repository = await Repository.create(path.join('test', 'fixtures'))
            //         fiber      = await repository.fibers.create('dev')
            //
            //         await repository.fibers.switch('dev')
            //     })
            //
            //     after(async () => {
            //         await clean()
            //     })
            //
            //     it("it should return current fiber's uuid", async () => {
            //         let uuid = await repository.fibers.current({ uuid: true })
            //
            //         uuid.should.equal(fiber.uuid)
            //     })
            // })
        })

        describe('#create', () => {
          describe('fiber does not exist', () => {
            describe('and fork option is enabled', () => {
              let snapshots, fiber

              describe('and open option is enabled', () => {
                before(async () => {
                  await initialize()
                  await master.snapshot()
                  snapshots = await master.log()
                })

                after(async () => {
                  await clean()
                })

                it('it should initialize fiber', async () => {
                  fiber = await plant.fibers.create('dev', { fork: true, open: true })

                  fiber.uuid.should.exist
                  fiber.index.should.exist
                  fiber.snapshots.should.exist
                  fiber.repository.should.deep.equal(plant)
                  fiber.paths.root.should.equal(path.join(plant.paths.fibers, fiber.uuid))
                  fiber.paths.index.should.equal(path.join(plant.paths.fibers, fiber.uuid, 'index'))
                  fiber.paths.snapshots.should.equal(path.join(plant.paths.fibers, fiber.uuid, 'snapshots'))
                })

                it("it should initialize fiber's directory structure", async () => {
                  fs.pathExistsSync(path.join(plant.paths.fibers, fiber.uuid)).should.equal(true)
                  fs.pathExistsSync(path.join(plant.paths.fibers, fiber.uuid, 'stash')).should.equal(true)
                })

                it("it should fork current's fiber snapshot history", async () => {
                  const snaps = await fiber.log()

                  snaps.should.deep.equal(snapshots)
                })

                it("it should open fiber's index and snapshots databases", async () => {
                  fiber.index.db.isOpen().should.equal(true)
                  fiber.snapshots.isOpen().should.equal(true)
                })

                it('it should stash fiber for further use', async () => {

                })

              })

            })

            // describe('and fork option is disabled', () => {
            //     before(async () => {
            //         repository = await Repository.create(path.join('test', 'fixtures'))
            //     })
            //
            //     after(async () => {
            //         await clean()
            //     })
            //
            //     it('it should initialize fiber', async () => {
            //
            //         fiber = await repository.fibers.create('dev')
            //
            //         fiber.repository.should.deep.equal(repository)
            //
            //     })
            //
            //     it('it should initialize fiber', async () => {})
            // })
          })

          // describe('fiber already exists', () => {
          //   it('it should throw ', async () => {
          //   })
          // })
        })

        // describe('#load', () => {})
        //
        // describe('#switch', () => {})

        // describe('#current', () => {
        //     describe('there is a current fiber', () => {
        //         let fiber_1, fiber_2, current
        //
        //         before(async () => {
        //             repository = await Repository.create(path.join('test', 'fixtures'))
        //             fiber_1    = await repository.fibers.create('fiber_1')
        //             fiber_2    = await repository.fibers.create('fiber_2')
        //         })
        //
        //         after(async () => {
        //             await clean()
        //         })
        //
        //         it('it should return current fiber', async () => {
        //             console.log('Switch one')
        //             await repository.fibers.switch('fiber_1')
        //             current = await repository.fibers.current({ uuid: true })
        //             current.should.equal(fiber_1.uuid)
        //             console.log('Switch two')
        //
        //             await repository.fibers.switch('fiber_2')
        //             current = await repository.fibers.current({ uuid: true })
        //             current.should.equal(fiber_2.uuid)
        //
        //             console.log('Switch three')
        //
        //             await repository.fibers.switch('master')
        //         })
        //     })
        // })

        describe('#rename', () => {})
    })
})
