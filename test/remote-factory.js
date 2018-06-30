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
      branch.should.equal('master')
    })
    
    it('should save remote address correctly', async () => {
      let address = utils.yaml.read(path.join(loom.paths.remotes, 'origin'))
      
      address.should.equal(remote.kernel.address)

    })
  })
  
  describe('#load', async () => {
    let loaded

    it('should load remote address correctly', async () => {
      let address = loom.remote.loadAddress('origin')
      
      address.should.equal(remote.kernel.address)
    })

    it('should load remote correctly', async () => {
      loaded = await loom.remote.load('origin')

      loaded.kernel.address.should.equal(remote.kernel.address)
      loaded.acl.address.should.equal(remote.acl.address)
      loaded.tree.address.should.equal(remote.tree.address)
      loaded.loom.should.deep.equal(loom)
      loaded.name.should.equal('origin')
    })
  })
  
  describe('#add', async () => {
    let deployed, added

    before(async () => {
      deployed = await Remote.deploy(loom)
    })
    
    it('should add remote correctly', async () => {
      added = await loom.remote.add('added', deployed.kernel.address)
      
      added.kernel.address.should.equal(deployed.kernel.address)
      added.acl.address.should.equal(deployed.acl.address)
      added.tree.address.should.equal(deployed.tree.address)
    })
    
    it('should save remote address correctly', async () => {
      let address = loom.remote.loadAddress('added')
      
      address.should.equal(deployed.kernel.address)
    })

    
  })
})
