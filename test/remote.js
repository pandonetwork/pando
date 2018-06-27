import Pando           from '../lib/main.js'
// import { Loom, Branch, Remote } from '../lib/main.js'
import { opts, cids }  from './data'
import * as utils      from './utils'
import * as fs        from 'fs-extra'
import chai            from 'chai'
import path            from 'path'
import { keccak256 } from 'js-sha3'


import 'chai/register-should'

const should = chai.should
const expect = chai.expect

chai.use(require('chai-as-promised'))

describe('Remote', () => {
  let pando, loom, remote

  before(async () => {
    pando  = new Pando(opts)
    loom   = await pando.loom.new(path.join('test','mocks'))
    remote = await loom.remote.deploy('origin')
  })

  after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })

  describe('#newBranch', async () => {
    it('should create remote branch correctly', async () => {
      expect(remote.newBranch('dev')).to.be.fulfilled
      let branch = await remote.tree.branches(1) 
      branch.should.equal('dev')
    })
  })
  
  describe('#getBranchesName', async () => {
    it('should return remote branches name correctly', async () => {
      let branches = await remote.getBranchesName()
      
      branches[0].should.equal('master')
      branches[1].should.equal('dev')
      expect(branches[2]).to.not.exist
    })
  })
})
