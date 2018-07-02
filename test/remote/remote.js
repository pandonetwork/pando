/* eslint-disable import/no-duplicates */
import Pando from '../../lib/pando.js'
import { Remote, Repository } from '../../lib/pando.js'
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

describe('Remote', () => {
  let pando, repository, remote, head, headDev

  before(async () => {
    pando = await Pando.create(opts)
    repository = await pando.repositories.create(npath.join('test', 'mocks'))
    remote = await repository.remotes.deploy('origin')
    await repository.stage([npath.join('test', 'mocks', 'test.md')])
    await repository.snapshot('My first snapshot')
    head = repository.head
    await repository.branches.create('dev')
    await remote.branches.create('dev')
    await repository.branches.checkout('dev')
    await repository.stage([
      npath.join('test', 'mocks', 'test-directory', 'test-1.md')
    ])
    await repository.snapshot('My first dev snapshot')
    headDev = repository.head
    await repository.push('origin', 'dev')
  })

  after(async () => {
    await Repository.remove(npath.join('test', 'mocks'))
  })

  describe('#push', async () => {
    it('should push head correctly', async () => {
      let tx = await remote.push('master', head)
      let eventHead = tx.logs.filter(l => l.event === 'NewSnapshot')[0].args.cid

      eventHead.should.be.equal(head)
    })

    it('should reject if remote branch does not exist', async () => {
      expect(remote.push('doesnotexist', head)).to.be.rejected()
    })

    it('should reject if cid is not valid', async () => {
      expect(remote.push('master', 'invalidcid')).to.be.rejected()
    })
  })

  describe('#head', async () => {
    it('should return head correctly', async () => {
      let remoteHead = await remote.head('master')

      remoteHead.should.be.equal(head)
    })

    it('should reject if remote branch does not exist', async () => {
      expect(remote.head('doesnotexist')).to.be.rejected()
    })
  })

  describe('#fetch', async () => {
    it('should fetch heads correctly', async () => {
      let heads = await remote.fetch()

      heads.master.should.equal(head)
      heads.dev.should.equal(headDev)
    })
  })

  describe('#show', async () => {
    it('should return remote informations correctly', async () => {
      let info = await remote.show()

      info.kernel.should.equal(remote.kernel.address)
      info.acl.should.equal(remote.acl.address)
      info.tree.should.equal(remote.tree.address)
      info.branches.master.head.should.equal(head)
      info.branches.dev.head.should.equal(headDev)
    })
  })
})
