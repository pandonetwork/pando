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

describe('Repository#RemoteFactory', () => {
  let pando, loom, remote

  before(async () => {
    pando  = new Pando(opts)
    loom   = await pando.loom.new(path.join('test','mocks'))
    remote = await loom.remote.deploy('origin')
  })

  after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })

  describe('#deploy', async () => {
    it('should deploy remote correctly', async () => {
      remote = await loom.remote.deploy('origin')
      let branch = await remote.tree.branches(0)
      
      expect(remote.kernel).to.exist
      expect(remote.acl).to.exist
      expect(remote.tree).to.exist
      remote.loom.should.deep.equal(loom)
      remote.name.should.equal('origin')
      remote.hash.should.equal('0x' + keccak256('origin'))
      branch.should.equal('master')
    })
    
    it('should save remote informations correctly', async () => {
      let info = utils.yaml.read(path.join(loom.paths.remotes, 'origin'))
      
      info.kernel.should.equal(remote.kernel.address)
      info.acl.should.equal(remote.acl.address)
      info.tree.should.equal(remote.tree.address)
    })
  })
  
  describe('#load', async () => {
    let loaded

    it('should load remote informations correctly', async () => {
      let info = loom.remote.loadInformations('origin')
      
      info.kernel.should.equal(remote.kernel.address)
      info.acl.should.equal(remote.acl.address)
      info.tree.should.equal(remote.tree.address)
    })

    it('should load remote correctly', async () => {
      loaded = await loom.remote.load('origin')

      loaded.kernel.address.should.equal(remote.kernel.address)
      loaded.acl.address.should.equal(remote.acl.address)
      loaded.tree.address.should.equal(remote.tree.address)
      loaded.loom.should.deep.equal(loom)
      loaded.name.should.equal('origin')
      loaded.hash.should.equal('0x' + keccak256('origin'))
    })
  })
})
