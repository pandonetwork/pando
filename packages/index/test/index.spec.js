/* eslint-disable import/no-duplicates */
import Repository from '@pando/repository'
import fs from 'fs-extra'
import Index from '../lib'
import path from 'path'
import chai from 'chai'
import { promisify } from 'util'
import capture from 'collect-console'

const expect = chai.expect()
const should = chai.should()


let cids = { origin: {}, modified: {}}

cids.origin['test.md'] = 'QmShBmhvEZ1dDwPvLvpjimRW76AQrVz3fbpZYwsqNJN2Xh'
cids.origin[path.join('dir', 'test_1.md')] = 'Qmaij6pBZtRmVf6sUUaJ4rRkwkF78aqT38GP1YSZho7yLY'
cids.origin[path.join('dir', 'test_2.md')] = 'Qme4pabV5DApSeHsuWu6gXa3EyUj58N85hdMfdD7372rnV'
cids.origin[path.join('dir', 'sub', 'test.md')] = 'QmfHhdmitp8duYj8fsvDTkeRWd5szP7qnS4qEC8oCt37Hr'

cids.modified['test.md'] = 'QmUenaNZqJKZvz3qMaNaF4VBTpddpnr97wf6REKte7pJtw'
cids.modified[path.join('dir', 'test_1.md')] = 'QmXtt8JV8xAc4R8syRLvYeCkGCkaSd49kTGnZBpfyq2Srq'
cids.modified[path.join('dir', 'test_2.md')] = 'Qme4pabV5DApSeHsuWu6gXa3EyUj58N85hdMfdD7372rnV'
cids.modified[path.join('dir', 'sub', 'test.md')] = 'QmRS8LgmCc4SNbtwxnLmNRhNdFfP2dRDwYUeC8WNkQXuqm'




const fixtures = {
    files: {
        modify: () => {
            fs.writeFileSync(path.join('test', 'fixtures', 'test.md'), 'modified test file\n', 'utf8')
            fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'test_1.md'), 'modified dir test file 1\n', 'utf8')
            fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'), 'modified sub test file\n', 'utf8')
        },

        remove: () => {
            fs.removeSync(path.join('test', 'fixtures', 'test.md'))
            fs.removeSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'))
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

describe('@pando/index', () => {
    let repository, index

    const clean = async () => {
        const reset = capture.log()

        await index.node.start()
        await index.node.stop()
        await index.index.close()

        reset()

        await repository.remove()
    }

    describe('#constructor', () => {
        before(async () => {
            repository = await Repository.create(path.join('test', 'fixtures'))
            index = await Index.create(repository)
        })

        after(async () => {
            await clean()
        })

        it('should initialize index correctly', async () => {
            // repository.index.repository.should.be.deep.equal(repository)
            // repository.index.path.should.equal(repository.paths.index)
        })
    })

    describe('#update', () => {
        describe('is called for the first time', () => {
            before(async () => {
                repository = await Repository.create(path.join('test', 'fixtures'))
                index = await Index.create(repository)
            })

            after(async () => {
                await clean()
                fixtures.restore()
            })


            it('it should initialize index', async () => {
                const result = await index.update()

                result['test.md'].wdir.should.equal(cids.origin['test.md'])
                result[path.join('dir', 'test_1.md')].wdir.should.equal(cids.origin[path.join('dir', 'test_1.md')])
                result[path.join('dir', 'test_2.md')].wdir.should.equal(cids.origin[path.join('dir', 'test_2.md')])
                result[path.join('dir', 'sub', 'test.md')].wdir.should.equal(cids.origin[path.join('dir', 'sub', 'test.md')])
            })
        })

        describe('is called after files have been modified', () => {
            before(async () => {
                repository = await Repository.create(path.join('test', 'fixtures'))
                index = await Index.create(repository)
            })

            after(async () => {
                await clean()
                fixtures.restore()
            })

            it('it should update index', async () => {
                await index.update()
                fixtures.files.modify()

                const result = await index.update()

                result['test.md'].wdir.should.equal(cids.modified['test.md'])
                result[path.join('dir', 'test_1.md')].wdir.should.equal(cids.modified[path.join('dir', 'test_1.md')])
                result[path.join('dir', 'test_2.md')].wdir.should.equal(cids.modified[path.join('dir', 'test_2.md')])
                result[path.join('dir', 'sub', 'test.md')].wdir.should.equal(cids.modified[path.join('dir', 'sub', 'test.md')])
            })
        })

        describe('is called after files have been removed', () => {
            before(async () => {
                repository = await Repository.create(path.join('test', 'fixtures'))
                index = await Index.create(repository)
            })

            after(async () => {
                await clean()
                fixtures.restore()
            })

            it('it should update index', async () => {
                await index.update()
                fixtures.files.remove()

                const result = await index.update()

                result['test.md'].wdir.should.equal('null')
                result[path.join('dir', 'sub', 'test.md')].wdir.should.equal('null')
            })
        })
    })


    describe('#stage', () => {
        describe('is called for the first time', () => {
            before(async () => {
                repository = await Repository.create(path.join('test', 'fixtures'))
                index = await Index.create(repository)
            })

            after(async () => {
                await clean()
                fixtures.restore()
            })


            it('it should initialize index', async () => {
                const staged = await index.stage([path.join('test', 'fixtures', 'test.md'), path.join('test', 'fixtures', 'dir', 'sub'), path.join('test', 'fixtures', 'dir')])

                console.log(staged)
            })
        })

        describe('is called after files have been modified', () => {
           before(async () => {
               repository = await Repository.create(path.join('test', 'fixtures'))
               index = await Index.create(repository)
           })

           after(async () => {
               await clean()
               fixtures.restore()
           })

           it('it should update index', async () => {
               await index.stage([path.join('test', 'fixtures', 'dir', 'sub')])
               fixtures.files.modify()

               const staged = await index.stage([path.join('test', 'fixtures', 'dir', 'sub')])

               console.log(staged)

               // result['test.md'].wdir.should.equal(cids.modified['test.md'])
               // result[path.join('dir', 'test_1.md')].wdir.should.equal(cids.modified[path.join('dir', 'test_1.md')])
               // result[path.join('dir', 'test_2.md')].wdir.should.equal(cids.modified[path.join('dir', 'test_2.md')])
               // result[path.join('dir', 'sub', 'test.md')].wdir.should.equal(cids.modified[path.join('dir', 'sub', 'test.md')])
           })
       })

       describe('is called after files have been removed', () => {
           before(async () => {
               repository = await Repository.create(path.join('test', 'fixtures'))
               index = await Index.create(repository)
           })

           after(async () => {
               await clean()
               fixtures.restore()
           })

           it('it should update index', async () => {
               await index.stage([path.join('test', 'fixtures', 'dir', 'sub')])

               fixtures.files.remove()


               const staged = await index.stage([path.join('test', 'fixtures', 'dir', 'sub')])

               console.log(staged)
           })
       })
    })
})
