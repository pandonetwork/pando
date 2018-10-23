/* eslint-disable import/no-duplicates */
import Pando from '../../lib'
import Repository from '../../lib/components/repository'
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
    after(async () => {
      repository = await pando.repositories.create(npath.join('test', 'mocks'))
    })

    it('should remove repository correctly', () => {
      Repository.remove(npath.join('test', 'mocks'))
      Repository.exists(npath.join('test', 'mocks')).should.be.equal(false)
    })
  })

  describe('getter#currentBranchName', async () => {
    before(async () => {
      await repository.branches.create('dev')
    })

    after(async () => {
      await repository.branches.checkout('master')
    })

    it('should get currentBranchName correctly', async () => {
      repository.currentBranchName.should.equal('master')
      await repository.branches.checkout('dev')
      repository.currentBranchName.should.equal('dev')
    })
  })

  describe('setter#currentBranchName', async () => {
    it('should set currentBranchName correctly', async () => {
      // TODO
    })
  })

  describe('getter#currentBranch', async () => {
    it('should get currentBranch correctly', async () => {
      const currentBranch = repository.currentBranch
      currentBranch.repository.should.deep.equal(repository)
      currentBranch.name.should.deep.equal('master')
      expect(currentBranch.remote).to.not.exist()
    })
  })

  describe('getter#head', async () => {
    it('should get head correctly', async () => {
      // TODO
    })
  })

  describe('getter#config', async () => {
    it('should get config correctly', async () => {
      // TODO
    })
  })

  describe('setter#config', async () => {
    it('should set config correctly', async () => {
      // TODO
    })
  })

  describe('#stage', async () => {
    before(async () => {
      await Repository.remove(npath.join('test', 'mocks'))
      repository = await pando.repositories.create(npath.join('test', 'mocks'))
    })

    after(async () => {
      await Repository.remove(npath.join('test', 'mocks'))
    })

    afterEach(() => {
      utils.test.cleanMocks()
    })

    it("should update repository's index fields correctly", async () => {
      let index

      index = repository.index.current
      index.should.be.empty()

      index = await repository.stage([
        npath.join('test', 'mocks', 'test.md'),
        npath.join('test', 'mocks', 'test-directory', 'test-1.md')
      ])

      index['test.md'].wdir.should.be.equal(cids['test.md'])
      index['test.md'].stage.should.be.equal(cids['test.md'])
      index['test.md'].repo.should.be.equal('null')
      index['test-directory/test-1.md'].wdir.should.be.equal(
        cids['test-directory/test-1.md']
      )
      index['test-directory/test-1.md'].stage.should.be.equal(
        cids['test-directory/test-1.md']
      )
      index['test-directory/test-1.md'].repo.should.be.equal('null')
      index['test-directory/test-2.md'].wdir.should.be.equal(
        cids['test-directory/test-2.md']
      )
      index['test-directory/test-2.md'].stage.should.be.equal('null')
      index['test-directory/test-2.md'].repo.should.be.equal('null')
      index['test-directory/test-subdirectory/test.md'].wdir.should.be.equal(
        cids['test-directory/test-subdirectory/test.md']
      )
      index['test-directory/test-subdirectory/test.md'].stage.should.equal(
        'null'
      )
      index['test-directory/test-subdirectory/test.md'].repo.should.equal(
        'null'
      )
    })

    it('should reject if file does not exist neither in working directory nor in index', () => {
      repository
        .stage([npath.join('test', 'mocks', 'doesnotexist')])
        .should.be.rejected()
    })

    it("should update repository's index field correctly when a file has been deleted", async () => {
      utils.fs.rm(npath.join('test', 'mocks', 'test.md'))
      let index = await repository.stage([
        npath.join('test', 'mocks', 'test.md')
      ])

      index['test.md'].wdir.should.equal('null')
      index['test.md'].stage.should.equal('todelete')
      index['test.md'].repo.should.equal('null')
      index['test-directory/test-1.md'].wdir.should.be.equal(
        cids['test-directory/test-1.md']
      )
      index['test-directory/test-1.md'].stage.should.be.equal(
        cids['test-directory/test-1.md']
      )
      index['test-directory/test-1.md'].repo.should.be.equal('null')
      index['test-directory/test-2.md'].stage.should.be.equal('null')
      index['test-directory/test-2.md'].repo.should.be.equal('null')
      index['test-directory/test-subdirectory/test.md'].wdir.should.be.equal(
        cids['test-directory/test-subdirectory/test.md']
      )
      index['test-directory/test-subdirectory/test.md'].stage.should.equal(
        'null'
      )
      index['test-directory/test-subdirectory/test.md'].repo.should.equal(
        'null'
      )
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
      Repository.remove(npath.join('test', 'mocks'))
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
      // let serialized = await repository.node.get(cid)
      let deserialized = await repository.fromCID(cid)

      deserialized.should.be.deep.equal(snapshot)
    })

    it("should delete repository's index entry if file has been deleted and staged", async () => {
      index = repository.index.current
      utils.fs.rm(npath.join('test', 'mocks', 'test.md'))
      await repository.stage([npath.join('test', 'mocks', 'test.md')])
      await repository.snapshot('Delete test.md')
      index = repository.index.current

      expect(index['test.md']).to.not.exist()
    })
  })

  describe('#log', () => {
    let snapshot1, snapshot2

    before(async () => {
      repository = await pando.repositories.create(npath.join('test', 'mocks'))
      await repository.stage([npath.join('test', 'mocks', 'test.md')])
      snapshot1 = await repository.snapshot('My first snapshot')
      await repository.stage([
        npath.join('test', 'mocks', 'test-directory', 'test-1.md')
      ])
      snapshot2 = await repository.snapshot('My decond snapshot')
    })

    after(() => {
      Repository.remove(npath.join('test', 'mocks'))
    })

    it('should return local branch history correctly', async () => {
      const log = await repository.log('master')

      log[0].should.deep.equal(snapshot2)
      log[1].should.deep.equal(snapshot1)
      expect(log[2]).to.not.exist()
    })
  })
})
