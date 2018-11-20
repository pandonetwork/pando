/* eslint-disable import/no-duplicates */
import Repository from '../../lib/'
import Fiber from '../../lib/fiber'
import fs from 'fs-extra'
import path from 'path'
import chai from 'chai'
import capture from 'collect-console'
import promised from 'chai-as-promised'

import fixtures from '../helpers/fixtures'

chai.use(promised)

const expect = chai.expect
const should = chai.should()

describe('@pando/repository/fibers/factory', () => {
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

    describe('#uuid', () => {
        describe('fiber exists', () => {
            before(async () => {
                await initialize()
            })

            after(async () => {
                await clean()
            })

            it("it should return fiber's uuid", async () => {
                let uuid = await repository.fibers.uuid('master')

                uuid.should.equal(master.uuid)
            })
        })

        describe("fiber does not exist", () => {
            before(async () => {
                repository = await Repository.create(path.join('test', 'fixtures'))
            })

            after(async () => {
                await clean()
            })

            it('it should reject with error E_FIBER_NOT_FOUND', async () => {
                return repository.fibers.uuid('doesnotexist').should.be.rejectedWith('E_FIBER_NOT_FOUND')
            })
        })
    })

    describe('#current', () => {
        describe('uuid option is disabled', () => {
            before(async () => {
                await initialize()
                fiber = await repository.fibers.create('dev')

                await repository.fibers.switch('dev')
            })

            after(async () => {
                await clean()
            })

            it('it should return current fiber', async () => {
                let current = await repository.fibers.current()

                current.uuid.should.equal(fiber.uuid)
            })
        })

        describe('uuid option is enabled', () => {
            before(async () => {
                await initialize()
                fiber = await repository.fibers.create('dev')

                await repository.fibers.switch('dev')
            })

            after(async () => {
                await clean()
            })

            it("it should return current fiber's uuid", async () => {
                let uuid = await repository.fibers.current({ uuid: true })

                uuid.should.equal(fiber.uuid)
            })
        })
    })

    describe('#create', () => {
        describe('fiber does not already exist', () => {
            describe('and fork option is enabled', () => {
                let snapshots

                describe('and open option is enabled', () => {
                    before(async () => {
                        await initialize()
                        await master.snapshot()
                        await master.snapshot()
                        await master.snapshot()
                        snapshots  = await master.log()
                    })

                    after(async () => {
                        await clean()
                    })

                    it('it should initialize fiber', async () => {
                        fiber = await repository.fibers.create('dev', { fork: true, open: true })

                        fiber.uuid.should.exist
                        fiber.index.should.exist
                        fiber.snapshots.should.exist
                        fiber.repository.should.deep.equal(repository)
                        fiber.paths.root.should.equal(path.join(repository.paths.fibers, fiber.uuid))
                        fiber.paths.index.should.equal(path.join(repository.paths.fibers, fiber.uuid, 'index'))
                        fiber.paths.snapshots.should.equal(path.join(repository.paths.fibers, fiber.uuid, 'snapshots'))
                    })

                    it("it should initialize fiber's directory structure", async () => {
                        fs.pathExistsSync(path.join(repository.paths.fibers, fiber.uuid)).should.equal(true)
                        fs.pathExistsSync(path.join(repository.paths.fibers, fiber.uuid, 'stash')).should.equal(true)
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

            describe('and fork option is disabled', () => {
                before(async () => {
                    repository = await Repository.create(path.join('test', 'fixtures'))
                })

                after(async () => {
                    await clean()
                })

                it('it should initialize fiber', async () => {

                    fiber = await repository.fibers.create('dev')

                    fiber.repository.should.deep.equal(repository)

                })

                it('it should initialize fiber', async () => {})
            })
        })

        describe('fiber already exists', () => {


            it('it should throw ', async () => {


            })

        })
    })

    describe('#load', () => {})

    describe('#list', () => {})

    describe('#switch', () => {})

    describe('#rename', () => {})
})
