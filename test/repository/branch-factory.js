/* eslint-disable import/no-duplicates */
import Pando from '../../lib/pando.js'
import { Repository } from '../../lib/pando.js'
/* eslint-enable import/no-duplicates */
import { opts, cids } from '../data'
import * as utils from '../utils'
import chai from 'chai'
import npath from 'path'
import Web3 from 'Web3'
import 'chai/register-should'

chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))

const expect = chai.expect

describe('Repository#BranchFactory', () => {
  let pando, repository

  before(async () => {
    pando = Pando.create(opts)
    repository = await pando.repositories.create(npath.join('test', 'mocks'))
  })

  after(async () => {
    await Repository.remove(npath.join('test', 'mocks'))
  })

  describe('#create', () => {
    let branch, remoteBranch

    before(async () => {
      branch = repository.branches.create('dev')
      remoteBranch = repository.branches.create('dev', { remote: 'origin' })
    })

    it('should initialize branch correctly', async () => {
      branch.should.exist()
    })

    it("should initialize branch's head correctly", async () => {
      branch.head.should.equal('undefined')
    })

    it('should throw if branch already exists', async () => {
      expect(() => repository.branches.create('dev')).to.throw()
    })

    it('should initialize remote branch correctly', async () => {
      remoteBranch.should.exist()
    })

    it("should initialize remote branch's head correctly", async () => {
      remoteBranch.head.should.equal('undefined')
    })

    it('should throw if remote branch already exists', async () => {
      expect(() =>
        repository.branches.create('dev', { remote: 'origin' })
      ).to.throw()
    })
  })

  describe('#load', () => {
    let branch, remoteBranch

    before(async () => {
      branch = repository.branches.load('dev')
      remoteBranch = repository.branches.load('dev', { remote: 'origin' })
    })

    it('should initialize branch correctly', async () => {
      branch.should.exist()
    })

    it("should initialize branch's head correctly", async () => {
      branch.head.should.equal('undefined')
    })

    it('should throw if branch does not exist', async () => {
      expect(() => repository.branches.load('doesnotexist')).to.throw()
    })

    it('should initialize remote branch correctly', async () => {
      remoteBranch.should.exist()
    })

    it("should initialize remote branch's head correctly", async () => {
      remoteBranch.head.should.equal('undefined')
    })

    it('should throw if remote branch does not exist', async () => {
      expect(() =>
        repository.branches.load('doesnotexist', { remote: 'origin' })
      ).to.throw()
    })
  })

  describe('#exists', () => {
    it('should return true if branch exists', async () => {
      repository.branches.exists('dev').should.equal(true)
    })

    it('should return false if branch does not exist', async () => {
      repository.branches.exists('doesnotexist').should.equal(false)
    })

    it('should return true if remote branch exists', async () => {
      repository.branches.exists('dev', { remote: 'origin' }).should.equal(true)
    })

    it('should return false if remote branch does not exist', async () => {
      repository.branches
        .exists('doesnotexist', { remote: 'origin' })
        .should.equal(false)
    })
  })

  describe('#head', () => {
    let branch, remoteBranch

    before(async () => {
      branch = repository.branches.load('dev')
      remoteBranch = repository.branches.load('dev', { remote: 'origin' })
    })

    it("should return branch's head correctly", async () => {
      branch.head = 'test'
      repository.branches.head('dev').should.equal('test')
    })

    it("should return remote branch's head correctly", async () => {
      remoteBranch.head = 'anothertest'
      repository.branches
        .head('dev', { remote: 'origin' })
        .should.equal('anothertest')
    })

    it('should throw if branch does not exist', async () => {
      expect(() => repository.branches.head('doesnotexist')).to.throw()
    })

    it('should throw if remote branch does not exist', async () => {
      expect(() =>
        repository.branches.head('doesnotexist', { remote: 'origin' })
      ).to.throw()
    })
  })

  describe('#checkout', () => {
    before(async () => {
      await Repository.remove(npath.join('test', 'mocks'))
      repository = await pando.repositories.create(npath.join('test', 'mocks'))
    })

    after(async () => {
      await Repository.remove(npath.join('test', 'mocks'))
      utils.test.cleanMocks()
    })

    it('should update current branch correctly', async () => {
      await repository.branches.create('dev')
      let branch1 = repository.currentBranchName
      await repository.branches.checkout('dev')
      let branch2 = repository.currentBranchName
      await repository.branches.checkout('master')
      let branch3 = repository.currentBranchName

      branch1.should.equal('master')
      branch2.should.equal('dev')
      branch3.should.equal('master')
    })

    it('should not modify working directory if checkout branch has no snapshot yet', async () => {
      await repository.branches.checkout('dev')

      utils.fs
        .exists(npath.join('test', 'mocks', 'test.md'))
        .should.be.equal(true)
      utils.fs
        .exists(npath.join('test', 'mocks', 'test-directory', 'test-1.md'))
        .should.be.equal(true)
      utils.fs
        .exists(npath.join('test', 'mocks', 'test-directory', 'test-2.md'))
        .should.be.equal(true)
      utils.fs
        .exists(
          npath.join(
            'test',
            'mocks',
            'test-directory',
            'test-subdirectory',
            'test.md'
          )
        )
        .should.be.equal(true)
    })

    it("should not delete working directory's unstaged (and unsnapshot) files", async () => {
      await repository.stage([npath.join('test', 'mocks', 'test.md')])
      await repository.snapshot('My first dev snapshot')
      await repository.branches.checkout('master')
      await repository.branches.checkout('dev')
      utils.fs.write(
        npath.join('test', 'mocks', 'test-2.md'),
        'This is a dev branch test file'
      )
      await repository.branches.checkout('master')

      utils.fs
        .exists(npath.join('test', 'mocks', 'test-2.md'))
        .should.be.equal(true)
    })

    it("should delete base branch's directories if they are not in the checkout branch", async () => {
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
      await repository.snapshot('My first master snapshot')
      await repository.branches.checkout('dev')

      utils.fs
        .exists(npath.join('test', 'mocks', 'test-directory'))
        .should.be.equal(false)
    })

    it("should delete base branch's files if they are not in the checkout branch", async () => {
      await repository.branches.checkout('master')
      utils.fs.write(
        npath.join('test', 'mocks', 'test-2.md'),
        'This is a master branch test file'
      )
      await repository.stage([npath.join('test', 'mocks', 'test-2.md')])
      await repository.snapshot('My second master snapshot')
      await repository.branches.checkout('dev')

      utils.fs
        .exists(npath.join('test', 'mocks', 'test-2.md'))
        .should.be.equal(false)
    })

    it("should keep base branch's directories and files if they are not modified in the checkout branch", async () => {
      await repository.branches.checkout('master')

      utils.fs
        .exists(npath.join('test', 'mocks', 'test.md'))
        .should.be.equal(true)
    })

    it("should create and download checkout branch's directories and files if they are not in the base branch", async () => {
      utils.fs
        .exists(npath.join('test', 'mocks', 'test-2.md'))
        .should.be.equal(true)
      utils.fs
        .exists(npath.join('test', 'mocks', 'test-directory'))
        .should.be.equal(true)
      utils.fs
        .exists(npath.join('test', 'mocks', 'test-directory', 'test-1.md'))
        .should.be.equal(true)
      utils.fs
        .exists(npath.join('test', 'mocks', 'test-directory', 'test-2.md'))
        .should.be.equal(true)
      utils.fs
        .exists(
          npath.join('test', 'mocks', 'test-directory', 'test-subdirectory')
        )
        .should.be.equal(true)
      utils.fs
        .exists(
          npath.join(
            'test',
            'mocks',
            'test-directory',
            'test-subdirectory',
            'test.md'
          )
        )
        .should.be.equal(true)
    })

    it("should update base branch's files if they are modified in the checkout branch", async () => {
      await repository.branches.checkout('dev')
      utils.fs.write(
        npath.join('test', 'mocks', 'test.md'),
        'This is a modified test file'
      )
      await repository.stage([npath.join('test', 'mocks', 'test.md')])
      await repository.snapshot('My second dev snapshot')

      await repository.branches.checkout('master')

      utils.fs
        .read(npath.join('test', 'mocks', 'test.md'))
        .should.equal('This is a test file')
    })

    it('should reject if checkout branch and base branch are identical', async () => {
      repository.branches.checkout('master').should.be.rejected()
    })

    it('should reject if branch does not exist', async () => {
      repository.branches.checkout('doesnotexist').should.be.rejected()
    })

    it('should reject in case of unstaged (and unsnapshot) modifications', async () => {
      utils.fs.write(
        npath.join('test', 'mocks', 'test.md'),
        'This is a modified (again) test file'
      )

      repository.branches.checkout('dev').should.be.rejected()
    })

    it('should reject in case of unsnapshot modifications', async () => {
      utils.fs.write(
        npath.join('test', 'mocks', 'test.md'),
        'This is a modified (again) test file'
      )
      await repository.stage([npath.join('test', 'mocks', 'test.md')])

      repository.branches.checkout('dev').should.be.rejected()
    })
  })
})
