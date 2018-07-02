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

describe('Repository', () => {
  let pando, repository

  before(async () => {
    pando = Pando.create(opts)
    repository = await pando.repositories.create(npath.join('test', 'mocks'))
  })

  after(async () => {
    await Repository.remove(npath.join('test', 'mocks'))
  })

  describe('static#exists', async () => {
    it('should return true if repository exists', () => {
      Repository.exists(npath.join('test', 'mocks')).should.be.equal(true)
    })
    it('should return false if repository does not exist', () => {
      Repository.exists('doesnotexist').should.be.equal(false)
    })
  })

  describe('static#remove', async () => {
    it('should remove repository correctly', () => {
      Repository.remove(npath.join('test', 'mocks'))
      Repository.exists(npath.join('test', 'mocks')).should.be.equal(false)
    })
  })

  describe('#stage', async () => {
    before(async () => {
      repository = await pando.repositories.create(npath.join('test', 'mocks'))
    })

    after(async () => {
      await Repository.remove(npath.join('test', 'mocks'))
    })

    afterEach(() => {
      utils.test.cleanMocks()
    })

    it("should update repository's index stage fields correctly", async () => {
      let index = await repository.stage([
        npath.join('test', 'mocks', 'test.md'),
        npath.join('test', 'mocks', 'test-directory', 'test-1.md'),
        npath.join('test', 'mocks', 'test-directory', 'test-2.md'),
        npath.join(
          'test',
          'mocks',
          'test-directory',
          'test-subdirectory',
          'test.md'
        )
      ])

      for (let path in cids) {
        index[path].stage.should.be.equal(cids[path])
      }
    })

    it('should reject if file does not exist in neither working directory nor index', () => {
      repository
        .stage([npath.join('test', 'mocks', 'doesnotexist')])
        .should.be.rejected()
    })

    it('should update stage fields correctly', async () => {
      let index = await repository.stage([
        npath.join('test', 'mocks', 'test.md'),
        npath.join('test', 'mocks', 'test-directory', 'test-1.md'),
        'test/mocks/test-directory/test-2.md',
        'test/mocks/test-directory/test-subdirectory/test.md'
      ])

      for (let path in cids) {
        index[path].stage.should.be.equal(cids[path])
      }
    })

    it("should update repository's index wdir field correctly if file has been deleted", async () => {
      utils.fs.rm(npath.join('test', 'mocks', 'test.md'))
      let index = await repository.stage([
        npath.join('test', 'mocks', 'test.md')
      ])

      index['test.md'].wdir.should.equal('null')
    })
  })

  describe('#snapshot', () => {
    let snapshot, index

    before(async () => {
      repository = await pando.repositories.create(npath.join('test', 'mocks'))
      await repository.stage([
        npath.join('test', 'mocks', 'test.md'),
        npath.join('test', 'mocks', 'test-directory', 'test-1.md'),
        npath.join('test', 'mocks', 'test-directory', 'test-2.md'),
        npath.join(
          'test',
          'mocks',
          'test-directory',
          'test-subdirectory',
          'test.md'
        )
      ])
      snapshot = await repository.snapshot('My first snapshot')
      index = repository.index.current
    })

    after(() => {
      utils.test.cleanMocks()
    })

    it("should update repository's index repo fields correctly", async () => {
      for (let path in cids) {
        index[path].repo.should.be.equal(cids[path])
      }
    })

    it("should build snapshot's tree correctly", async () => {
      snapshot.tree.path.should.be.equal('.')
      snapshot.tree.children['test.md'].should.exist()
      snapshot.tree.children['test.md'].path.should.equal('test.md')
      snapshot.tree.children['test.md'].link.should.equal(cids['test.md'])
      snapshot.tree.children['test-directory'].should.exist()
      snapshot.tree.children['test-directory'].path.should.equal(
        'test-directory'
      )
      snapshot.tree.children['test-directory'].children[
        'test-1.md'
      ].should.exist()
      snapshot.tree.children['test-directory'].children[
        'test-1.md'
      ].path.should.equal('test-directory/test-1.md')
      snapshot.tree.children['test-directory'].children[
        'test-1.md'
      ].link.should.equal(cids['test-directory/test-1.md'])
      snapshot.tree.children['test-directory'].children[
        'test-2.md'
      ].should.exist()
      snapshot.tree.children['test-directory'].children[
        'test-2.md'
      ].path.should.equal('test-directory/test-2.md')
      snapshot.tree.children['test-directory'].children[
        'test-2.md'
      ].link.should.equal(cids['test-directory/test-2.md'])
      snapshot.tree.children['test-directory'].children[
        'test-subdirectory'
      ].should.exist()
      snapshot.tree.children['test-directory'].children[
        'test-subdirectory'
      ].path.should.equal('test-directory/test-subdirectory')
      snapshot.tree.children['test-directory'].children[
        'test-subdirectory'
      ].children['test.md'].should.exist()
      snapshot.tree.children['test-directory'].children[
        'test-subdirectory'
      ].children['test.md'].path.should.equal(
        'test-directory/test-subdirectory/test.md'
      )
      snapshot.tree.children['test-directory'].children[
        'test-subdirectory'
      ].children['test.md'].link.should.equal(
        cids['test-directory/test-subdirectory/test.md']
      )
    })

    it('should push snapshot to ipfs/ipld correctly', async () => {
      let cid = await snapshot.cid()
      let serialized = await repository.node.get(cid)
      let deserialized = await repository.fromIPLD(serialized)

      deserialized.should.be.deep.equal(snapshot)
    })

    it('should push snapshot to ipfs/ipld correctly', async () => {
      let cid = await snapshot.cid()
      let serialized = await repository.node.get(cid)
      let deserialized = await repository.fromIPLD(serialized)

      deserialized.should.be.deep.equal(snapshot)
    })

    it("should delete repository's index entry if file has been deleted and staged", async () => {
      index = repository.index.current
      console.log(index)
      utils.fs.rm(npath.join('test', 'mocks', 'test.md'))
      await repository.stage([npath.join('test', 'mocks', 'test.md')])
      index = repository.index.current
      console.log(index)
      await repository.snapshot('Delete test.md')
      index = repository.index.current

      expect(index['test.md']).to.not.exist()
    })
  })
})
