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
  
  describe('#load', async () => {
    let address
    
    before(async () => {
      address = remote.kernel.address
    })
    
    it('should return acl correctly', async () => {
      let acl = await remote.kernel.acl()
    
      acl.should.be.equal(remote.acl.address)
    })
    
    it('should return tree correctly', async () => {
      let treeAddress = await remote.kernel.getApp(Remote.TREE_APP_ID)
      // let tree2 = await remote.kernel.getApp(Remote.TREE_APP_ID2)
      
      // let proxy = pando.contracts.appProxyUpgradeable.at(remote.tree.address)
      
      // let imp = await proxy.implementation()
      // 
      // console.log('Imp: ' + imp)
      // console.log('Tree2: ' + tree2)
      // console.log('Tree: ' + tree)
      // console.log('remote.tree: ' + remote.tree.address) // address du proxy
    
      treeAddress.should.be.equal(remote.tree.address)
    })
    
    
  })
  
  describe('#push', async () => {
    let address
    
    before(async () => {
      address = remote.kernel.address
    })
    
    it('should push head correctly', async () => {
      let tx   = await remote.push('dev', 'Qmv')
      let head = tx.logs.filter(l => l.event === 'NewSnapshot')[0].args.cid
          
      head.should.be.equal('Qmv')
    })
  
  })
  
  describe('#head', async () => {
    it('should return head correctly', async () => {
      let head = await remote.head('dev')
      
      head.should.be.equal('Qmv')
    })
  
  })
  
  describe('#show', async () => {
    it('should return remote informations correctly', async () => {
      let info = await remote.show()
      
      console.log(info)
    })
  
  })
  
  describe('#fetch', async () => {
    
    before(async () => {
      await loom.checkout('master')
      await loom.stage(['test/mocks/test.md'])
      await loom.snapshot('First commit')
      await loom.push('origin', 'master')
      await loom.branch.new('dev')
      console.log('après dev')
      
      // let origin = await loom.remote.load('origin')
      // console.log('après load')
      await loom.checkout('dev')
      await loom.stage(['test/mocks/test.md'])
      await loom.snapshot('First dev commit')
      await loom.push('origin', 'dev')
      console.log('après new branch')
      
    })
    
    it('should fetch head correctly', async () => {
      let origin = await loom.remote.load('origin')
      console.log('Avant fetch')
      let heads  = await origin.fetch()
      
      console.log(heads)
    })
  
  })
  
//   function acl() public view returns (IACL)
// Get the installed ACL app.
// 
// Returns:
// ACL app
// getApp
// function getApp(bytes32 _id) public view returns (address)
// 
})
