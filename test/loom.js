import Pando                    from '../lib/main.js'
import { Snapshot, Tree, Loom, Fibre } from '../lib/main.js'
import { opts, cids }           from './data'
import * as utils               from './utils'
import chai                     from 'chai'
import path         from 'path'
import * as fs from 'fs-extra'


import 'chai/register-should'

const should = chai.should
const expect = chai.expect

chai.use(require('chai-as-promised'))

describe('Loom', () => {

  let pando, loom

  before(async () => {
    pando = new Pando(opts)
  })

  after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })

  describe('#new', async () => {
  
    before(async () => { loom = await pando.loom.new(path.join('test','mocks')) })
  
    after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })
  
    it('should initialize loom\'s paths correctly', () => {
      loom.paths.root.should.be.equal(path.join('test','mocks'))
      loom.paths.pando.should.be.equal(path.join('test','mocks','.pando'))
      loom.paths.ipfs.should.be.equal(path.join('test','mocks','.pando','ipfs'))
      loom.paths.index.should.be.equal(path.join('test','mocks','.pando','index'))
      loom.paths.current.should.be.equal(path.join('test','mocks','.pando','current'))
      loom.paths.fibres.should.be.equal(path.join('test','mocks','.pando','fibres'))
    })
    it('should initialize loom\'s index correctly', () => {
      loom.index.should.exist
      loom.index.loom.should.be.deep.equal(loom)
    })
    it('should initialize loom\'s node correctly', () => {
      loom.node.should.exist
      loom.node.loom.should.be.deep.equal(loom)
      loom.node.ipfs.should.exist
      loom.node.ipld.should.exist
    })
    it('should initialize loom\'s .pando directory correctly', () => {
      utils.fs.exists(path.join('test','mocks','.pando')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','ipfs')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','index')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','current')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','fibres')).should.be.equal(true)
    })
    it('should initialize master branch correctly', () => {
      utils.fs.exists(path.join('test','mocks','.pando')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','ipfs')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','index')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','current')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','fibres')).should.be.equal(true)
    })
  })
  
  describe('#load', async () => {
    let loaded
  
    before(async () => {
      loom   = await pando.loom.new(path.join('test','mocks'))
      loaded = await pando.loom.load(path.join('test','mocks'))
    })
  
    after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })
  
    it('should initialize loom\'s paths correctly', () => {
      loaded.paths.root.should.be.equal(path.join('test','mocks'))
      loaded.paths.pando.should.be.equal(path.join('test','mocks','.pando'))
      loaded.paths.ipfs.should.be.equal(path.join('test','mocks','.pando','ipfs'))
      loaded.paths.index.should.be.equal(path.join('test','mocks','.pando','index'))
      loaded.paths.current.should.be.equal(path.join('test','mocks','.pando','current'))
      loaded.paths.fibres.should.be.equal(path.join('test','mocks','.pando','fibres'))
    })
    it('should initialize loom\'s index correctly', () => {
      loaded.index.should.exist
      loaded.index.loom.should.be.deep.equal(loaded)
    })
    it('should initialize loom\'s node correctly', () => {
      loaded.node.should.exist
      loaded.node.loom.should.be.deep.equal(loaded)
      loaded.node.ipfs.should.exist
      loaded.node.ipld.should.exist
    })
    it('should initialize loom\'s .pando directory correctly', () => {
      utils.fs.exists(path.join('test','mocks','.pando')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','ipfs')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','index')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','current')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','.pando','fibres')).should.be.equal(true)
    })
    it('should reject if loom does not exist', () => {
      pando.loom.load('test').should.be.rejected
    })
  })
  
  describe('#exists', async () => {
  
    before(async () => { loom = await pando.loom.new(path.join('test','mocks')) })
  
    after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })
  
    it('should return true if loom exists', () => {
      Loom.exists(path.join('test','mocks')).should.be.equal(true)
    })
    it('should return false if loom does not exist', () => {
      Loom.exists(path.join('test','downloads')).should.be.equal(false)
    })
  })

  describe('#stage', async () => {  
    before(async () => { loom = await pando.loom.new(path.join('test','mocks')) })
  
    after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })
  
    it('should update loom\'s index stage fields correctly', async () => {
      let index = await loom.stage([path.join('test','mocks','test.md'), path.join('test','mocks','test-directory','test-1.md'), path.join('test','mocks','test-directory','test-2.md'),path.join('test','mocks','test-directory','test-subdirectory','test.md')])
  
      for (let path in cids) {
        index[path].stage.should.be.equal(cids[path])
      }
    })
  })
  
  describe('#snapshot', async () => {
    let snapshot, index
  
    before(async () => {
      loom     = await pando.loom.new(path.join('test','mocks'))
      index    = await loom.stage([path.join('test','mocks','test.md'), path.join('test','mocks','test-directory','test-1.md'), path.join('test','mocks','test-directory','test-2.md'),path.join('test','mocks','test-directory','test-subdirectory','test.md')])
      snapshot = await loom.snapshot('My first snapshot')
      index    = await loom.index.current
    })
  
    after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })
  
    it('should update loom\'s index repo fields correctly', async () => {
      for (let path in cids) {
        index[path].repo.should.be.equal(cids[path])
      }
    })

    it('should build snapshot\'s tree correctly', async () => {
      snapshot.tree.path.should.be.equal('.')
      snapshot.tree.children['test.md'].should.exist
      snapshot.tree.children['test.md'].path.should.equal('test.md')
      snapshot.tree.children['test.md'].link.should.equal(cids['test.md'])
      snapshot.tree.children['test-directory'].should.exist
      snapshot.tree.children['test-directory'].path.should.equal('test-directory')
      snapshot.tree.children['test-directory'].children['test-1.md'].should.exist
      snapshot.tree.children['test-directory'].children['test-1.md'].path.should.equal('test-directory/test-1.md')
      snapshot.tree.children['test-directory'].children['test-1.md'].link.should.equal(cids['test-directory/test-1.md'])
      snapshot.tree.children['test-directory'].children['test-2.md'].should.exist
      snapshot.tree.children['test-directory'].children['test-2.md'].path.should.equal('test-directory/test-2.md')
      snapshot.tree.children['test-directory'].children['test-2.md'].link.should.equal(cids['test-directory/test-2.md'])
      snapshot.tree.children['test-directory'].children['test-subdirectory'].should.exist
      snapshot.tree.children['test-directory'].children['test-subdirectory'].path.should.equal('test-directory/test-subdirectory')
      snapshot.tree.children['test-directory'].children['test-subdirectory'].children['test.md'].should.exist
      snapshot.tree.children['test-directory'].children['test-subdirectory'].children['test.md'].path.should.equal('test-directory/test-subdirectory/test.md')
      snapshot.tree.children['test-directory'].children['test-subdirectory'].children['test.md'].link.should.equal(cids['test-directory/test-subdirectory/test.md'])
    })

    it('should push snapshot to ipfs/ipld correctly', async () => {
      let cid          = await snapshot.cid()
      let serialized   = await loom.node.get(cid)
      let deserialized = await loom.fromIPLD(serialized)
  
      deserialized.should.be.deep.equal(snapshot)
    })
  })
  

  describe('#checkout', async () => {
    before(async () => {
      loom     = await pando.loom.new(path.join('test','mocks'))
    })

    after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })
    
    afterEach(() => {
      if (utils.fs.exists(path.join('test','mocks','test.md'))) {
        utils.fs.rm(path.join('test','mocks','test.md'))
      }
      if (utils.fs.exists(path.join('test','mocks','test-directory','test-1.md'))) {
        utils.fs.rm(path.join('test','mocks','test-directory','test-1.md'))
      }
      if (utils.fs.exists(path.join('test','mocks','test-directory','test-2.md'))) {
        utils.fs.rm(path.join('test','mocks','test-directory','test-2.md'))
      }
      if (utils.fs.exists(path.join('test','mocks','test-directory','test-subdirectory','test.md'))) {
        utils.fs.rm(path.join('test','mocks','test-directory','test-subdirectory','test.md'))
      }
      
      if (!utils.fs.exists(path.join('test','mocks','test-directory'))) {
        utils.fs.mkdir(path.join('test','mocks','test-directory'))
      }
      
      if (!utils.fs.exists(path.join('test','mocks','test-directory','test-subdirectory'))) {
        utils.fs.mkdir(path.join('test','mocks','test-directory','test-subdirectory'))
      }
      
      fs.copyFileSync(path.join('test','mocks-backup','test.md'), path.join('test','mocks','test.md'))
      fs.copyFileSync(path.join('test','mocks-backup','test-directory','test-1.md'), path.join('test','mocks','test-directory','test-1.md'))
      fs.copyFileSync(path.join('test','mocks-backup','test-directory','test-2.md'), path.join('test','mocks','test-directory','test-2.md'))
      fs.copyFileSync(path.join('test','mocks-backup','test-directory','test-subdirectory','test.md'), path.join('test','mocks','test-directory','test-subdirectory','test.md'))
    })
    
    it('should update current branch correctly', async () => {
      await Fibre.new(loom, 'dev')
      let branch1 = loom.currentBranchName
      await loom.checkout('dev')
      let branch2 = loom.currentBranchName
      await loom.checkout('master')
      let branch3 = loom.currentBranchName

      branch1.should.equal('master')
      branch2.should.equal('dev')
      branch3.should.equal('master')
    })
    
    it('should not modify working directory if checkout branch has no snapshot yet', async () => {
      await loom.checkout('master')
      await loom.checkout('dev')
      
      utils.fs.exists(path.join('test','mocks','test.md')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','test-directory','test-1.md')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','test-directory','test-2.md')).should.be.equal(true)      
      utils.fs.exists(path.join('test','mocks','test-directory','test-subdirectory', 'test.md')).should.be.equal(true)
  
    })
    
    it('should not delete working directory\'s unstaged (and unsnapshot) files', async () => {
      await loom.checkout('master')
      
      await loom.checkout('dev')
      utils.fs.write(path.join('test','mocks','test-2.md'), 'This is a dev branch test file')
      await loom.checkout('master')

      utils.fs.exists(path.join('test','mocks','test-2.md')).should.be.equal(true)
    })
  
    it('should delete base branch\'s directories if they are not in the checkout branch', async () => {
      await loom.checkout('master')
      await loom.stage([path.join('test','mocks','test.md'), path.join('test','mocks','test-directory','test-1.md'), path.join('test','mocks','test-directory','test-2.md'),path.join('test','mocks','test-directory','test-subdirectory','test.md')])
      await loom.snapshot('My first master snapshot')
      
      await loom.checkout('dev')
      await loom.stage([path.join('test','mocks','test.md')])
      await loom.snapshot('My first dev snapshot')
      
      await loom.checkout('master')
      await loom.checkout('dev')
      
      utils.fs.exists(path.join('test','mocks','test-directory')).should.be.equal(false)
    })
    
    it('should delete base branch\'s files if they are not in the checkout branch', async () => {
      await loom.checkout('master')
      
      utils.fs.write(path.join('test','mocks','test-2.md'), 'This is a master branch test file')
      await loom.stage([path.join('test','mocks','test-2.md')])
      await loom.snapshot('My second master snapshot')
      
      await loom.checkout('dev')
      
      utils.fs.exists(path.join('test','mocks','test-2.md')).should.be.equal(false)
    })
    
    it('should keep base branch\'s directories and files if they are in the checkout branch', async () => {
      await loom.checkout('master')
      await loom.checkout('dev')
      
      utils.fs.exists(path.join('test','mocks','test.md')).should.be.equal(true)
    })
    
    it('should create and download checkout branch\'s directories and files if they are not in the base branch', async () => {
      await loom.checkout('dev')
      await loom.checkout('master')
      
      utils.fs.exists(path.join('test','mocks','test-2.md')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','test-directory')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','test-directory','test-1.md')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','test-directory','test-2.md')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','test-directory','test-subdirectory')).should.be.equal(true)
      utils.fs.exists(path.join('test','mocks','test-directory','test-subdirectory','test.md')).should.be.equal(true)
    })
    
    it('should update base branch\'s files if they are modified in the checkout branch', async () => {
      await loom.checkout('dev')
      utils.fs.write(path.join('test','mocks','test.md'), 'This is a modified test file')
      await loom.stage([path.join('test','mocks','test.md')])
      await loom.snapshot('My second dev snapshot')
      
      await loom.checkout('master')
      
      utils.fs.read(path.join('test','mocks','test.md')).should.equal('This is a test file')      
    })
    
    it('should throw if branch does not exist', async () => {
      loom.checkout('doesnotexist').should.be.rejected
    })
    
    it('should throw in case of unstaged (and unsnapshot) modifications', async () => {
      await loom.checkout('master')
      
      utils.fs.write(path.join('test','mocks','test.md'), 'This is a modified (again) test file')
    
      loom.checkout('dev').should.be.rejected  
    })
    
    it('should throw in case of unsnapshot modifications', async () => {
      await loom.checkout('master')
      
      utils.fs.write(path.join('test','mocks','test.md'), 'This is a modified (again) test file')
      await loom.stage([path.join('test','mocks','test.md')])

      await loom.checkout('dev').should.be.rejected
    })
  })

  
  
  

  describe('FibreFactory', () => {
    let loom

    before(async () => {
      loom = await pando.loom.new(path.join('test','mocks'))
    })

    after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })

    describe('#new', () => {
      it('should initialize fibre correctly', async () => {
        let aragon = await loom.fibre.new('aragon')

        aragon.name.should.be.equal('aragon')
        aragon.path.should.be.equal(path.join('test','mocks','.pando','fibres','aragon'))
        // check that specimen is undefined
      })
      // it('should locally save new fiber object properly', () => {
      //
      // })
    })

  })


})
