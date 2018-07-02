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

describe('Remote#RemoteBranchFactory', () => {
  let pando, repository, remote

  before(async () => {
    pando = new Pando(opts)
    repository = await pando.repositories.create(npath.join('test', 'mocks'))
    remote = await repository.remotes.deploy('origin')
  })

  after(async () => {
    await Repository.remove(npath.join('test', 'mocks'))
  })

  describe('#create', () => {
    it('should create remote branch correctly', async () => {
      expect(remote.branches.create('dev')).to.be.fulfilled()
      let branch = await remote.tree.branches(1)
      branch.should.equal('dev')
    })
  })

  describe('#list', async () => {
    it('should return remote branches list correctly', async () => {
      let branches = await remote.branches.list()

      branches[0].should.equal('master')
      branches[1].should.equal('dev')
      expect(branches[2]).to.not.exist
    })
  })
})
