/* eslint-disable import/no-duplicates */
import Pando from '../../lib'
import Repository from '../../lib/components/repository'
/* eslint-enable import/no-duplicates */
import { opts } from '../data'
import chai from 'chai'
import npath from 'path'
import 'chai/register-should'

chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))

describe('Pando#RepositoryFactory', () => {
  let pando

  before(async () => {
    pando = Pando.create(opts)
  })

  after(async () => {
    await Repository.remove(npath.join('test', 'mocks'))
  })

  describe('#create', () => {
    let repository

    before(async () => {
      repository = await pando.repositories.create(npath.join('test', 'mocks'))
    })

    it('should initialize repository correctly', async () => {
      repository.should.exist()
      repository.pando.should.deep.equal(pando)
    })

    it("should initialize repository's paths correctly", () => {
      for (let path in Repository.paths) {
        repository.paths[path].should.be.equal(
          npath.join('test', 'mocks', Repository.paths[path])
        )
      }
    })

    it("should initialize repository's index correctly", () => {
      repository.index.should.exist()
      repository.index.repository.should.be.deep.equal(repository)
    })

    it("should initialize repository's node correctly", () => {
      repository.node.should.exist()
      repository.node.repository.should.be.deep.equal(repository)
      repository.node.ipfs.should.exist()
      // test ipfs configuration
    })

    it("should initialize repository's branch factory correctly", () => {
      repository.branches.should.exist()
      repository.branches.repository.should.be.deep.equal(repository)
    })

    it("should initialize repository's remote factory correctly", () => {
      repository.remotes.should.exist()
      repository.remotes.repository.should.be.deep.equal(repository)
    })

    it('should reject if repository already exists', async () => {
      pando.repositories
        .create(npath.join('test', 'mocks'))
        .should.be.rejected()
    })
  })

  describe('#load', () => {
    let loaded

    before(async () => {
      loaded = await pando.repositories.load(npath.join('test', 'mocks'))
    })

    it('should initialize repository correctly', async () => {
      loaded.should.exist()
      // loaded.pando.should.be.deep.equal(pando)
    })

    it("should initialize repository's paths correctly", () => {
      for (let path in Repository.paths) {
        loaded.paths[path].should.be.equal(
          npath.join('test', 'mocks', Repository.paths[path])
        )
      }
    })

    it("should initialize repository's index correctly", () => {
      loaded.index.should.exist()
      loaded.index.repository.should.be.deep.equal(loaded)
    })

    it("should initialize repository's node correctly", () => {
      loaded.node.should.exist()
      loaded.node.repository.should.be.deep.equal(loaded)
      loaded.node.ipfs.should.exist()
      // test ipfs configuration
    })

    it("should initialize repository's branch factory correctly", () => {
      loaded.branches.should.exist()
      loaded.branches.repository.should.be.deep.equal(loaded)
    })

    it("should initialize repository's remote factory correctly", () => {
      loaded.remotes.should.exist()
      loaded.remotes.repository.should.be.deep.equal(loaded)
    })

    it('should reject if repository does not exist', async () => {
      pando.repositories.load('doesnotexist').should.be.rejected()
    })
  })

  describe('#exists', () => {
    it('should return true if repository exists', async () => {
      pando.repositories.exists(npath.join('test', 'mocks')).should.equal(true)
    })

    it('should return false if repository does not exist', async () => {
      pando.repositories.exists('doesnotexist').should.equal(false)
    })
  })
})
