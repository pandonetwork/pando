/* eslint-disable import/no-duplicates */
import Pando from '../../lib/pando.js'
import { Repository } from '../../lib/pando.js'
/* eslint-enable import/no-duplicates */
import { opts, cids } from '../data'
import * as utils from '../utils'
import chai from 'chai'
import npath from 'path'
import 'chai/register-should'

chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))

const expect = chai.expect

describe('Repository#Index', () => {
  let pando, repository

  before(async () => {
    pando = await Pando.create(opts)
    repository = await pando.repositories.create(npath.join('test', 'mocks'))
  })

  after(async () => {
    await Repository.remove(npath.join('test', 'mocks'))
  })

  describe('#constructor', () => {
    it('should initialize index correctly', async () => {
      repository.index.repository.should.be.deep.equal(repository)
      repository.index.path.should.equal(repository.paths.index)
    })
  })

  describe('#staged', () => {
    it('should return staged files correctly', async () => {
      await repository.stage([
        npath.join('test', 'mocks', 'test.md'),
        npath.join('test', 'mocks', 'test-directory', 'test-1.md')
      ])
      let staged = repository.index.staged

      staged[0].should.equal(npath.join('test-directory', 'test-1.md'))
      staged[1].should.equal('test.md')
      expect(staged[2]).to.not.exist()
    })
  })

  describe('#unsnapshot', () => {
    it('should return unspnashot files correctly', async () => {
      await repository.stage([
        npath.join('test', 'mocks', 'test.md'),
        npath.join('test', 'mocks', 'test-directory', 'test-1.md')
      ])
      let unsnapshot = repository.index.unsnapshot

      unsnapshot[0].should.equal(npath.join('test-directory', 'test-1.md'))
      unsnapshot[1].should.equal('test.md')
      expect(unsnapshot[2]).to.not.exist()
    })
  })

  describe('#modified', () => {
    after(() => {
      utils.test.cleanMocks()
    })

    it('should return modified files correctly', async () => {
      await repository.stage([npath.join('test', 'mocks', 'test.md')])
      utils.fs.write(
        npath.join('test', 'mocks', 'test.md'),
        'This is a modified test file'
      )
      await repository.index.update()
      let modified = repository.index.modified

      modified[0].should.equal('test.md')
      expect(modified[1]).to.not.exist()
    })
  })

  describe('#update', () => {
    before(async () => {
      await Repository.remove(npath.join('test', 'mocks'))
      repository = await pando.repositories.create(npath.join('test', 'mocks'))
    })

    afterEach(() => {
      utils.test.cleanMocks()
    })

    it('should compute hashes properly', async () => {
      let index = await repository.index.update()

      for (let path in cids) {
        index[path].wdir.should.be.equal(cids[path])
      }
    })

    it('should update wdir field correctly when a file is modified', async () => {
      let cid = 'QmenBbcSZowrrBqPjpmH6LSXfLe7jtuxrQ8iGWdteTsNE9'
      utils.fs.write(
        npath.join('test', 'mocks', 'test.md'),
        'This is a modified test file'
      )
      let index = await repository.index.update()

      index['test.md'].wdir.should.be.equal(cid)
    })

    it('should update wdir field correctly when a file is added', async () => {
      let cid = 'QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX'
      utils.fs.write(
        npath.join('test', 'mocks', 'test-2.md'),
        'This is a test file'
      )
      let index = await repository.index.update()

      index['test-2.md'].wdir.should.be.equal(cid)
    })

    it('should update wdir field correctly when a file is deleted', async () => {
      utils.fs.rm(npath.join('test', 'mocks', 'test.md'))
      let index = await repository.index.update()

      index['test.md'].wdir.should.be.equal('null')
    })
  })

  describe('#reinitialize', () => {
    before(async () => {
      await Repository.remove(npath.join('test', 'mocks'))
      repository = await pando.repositories.create(npath.join('test', 'mocks'))
    })

    it('should reinitialize index correctly', async () => {
      await repository.stage([npath.join('test', 'mocks', 'test.md')])
      let snapshot = await repository.snapshot('My first snapshot')
      let reinitialized = await repository.index.reinitialize(
        await snapshot.tree.toIPLD()
      )

      reinitialized['test.md'].wdir.should.equal(cids['test.md'])
      reinitialized['test.md'].stage.should.equal(cids['test.md'])
      reinitialized['test.md'].repo.should.equal(cids['test.md'])
    })
  })
})
