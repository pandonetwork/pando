import Pando           from '../lib/main.js'
import { Remote } from '../lib/main.js'
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

describe('RemoteBranchFactory', () => {
  let pando, loom, remote

  before(async () => {
    pando  = new Pando(opts)
    loom   = await pando.loom.new(path.join('test','mocks'))
  })

  after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })

  describe('#new', async () => {
    it('should create remote branch correctly', async () => {
      let branch = await loom.branch.new('master', { remote: 'origin' })
      console.log(branch.nameLong)
      branch.name.should.equal('master')
      branch.remote.should.equal('origin')
      branch.nameLong.should.equal('origin:master')
      utils.fs.exists('test/mocks/.pando/branches/origin:master').should.be.true
    })
  })

})
