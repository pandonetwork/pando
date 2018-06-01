import Pando                    from '../lib/main.js'
import { Snapshot, Tree, Loom } from '../lib/main.js'
import { opts, cids }           from './data'
import * as utils               from './utils'
import chai                     from 'chai'
import 'chai/register-should'

const should = chai.should
const expect = chai.expect

chai.use(require('chai-as-promised'))

describe('Loom', () => {
  
  let pando, loom
  
  before(async () => {
    pando = new Pando(opts)
  })
  
  after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
  
  describe('#new', async () => {
  
    before(async () => { loom = await pando.loom.new('test/mocks') })
  
    after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
  
    it('should initialize loom\'s paths correctly', () => {
      loom.paths.root.should.be.equal('test/mocks')
      loom.paths.pando.should.be.equal('test/mocks/.pando')
      loom.paths.ipfs.should.be.equal('test/mocks/.pando/ipfs')
      loom.paths.index.should.be.equal('test/mocks/.pando/index')
      loom.paths.current.should.be.equal('test/mocks/.pando/current')
      loom.paths.fibres.should.be.equal('test/mocks/.pando/fibres')
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
      utils.fs.exists('test/mocks/.pando').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/ipfs').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/index').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/current').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/fibres').should.be.equal(true)
    })
  })
  
  describe('#load', async () => {
    let loaded
    
    before(async () => {
      loom   = await pando.loom.new('test/mocks')
      loaded = await pando.loom.load('test/mocks')
    })
  
    after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
  
    it('should initialize loom\'s paths correctly', () => {
      loaded.paths.root.should.be.equal('test/mocks')
      loaded.paths.pando.should.be.equal('test/mocks/.pando')
      loaded.paths.ipfs.should.be.equal('test/mocks/.pando/ipfs')
      loaded.paths.index.should.be.equal('test/mocks/.pando/index')
      loaded.paths.current.should.be.equal('test/mocks/.pando/current')
      loaded.paths.fibres.should.be.equal('test/mocks/.pando/fibres')
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
      utils.fs.exists('test/mocks/.pando').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/ipfs').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/index').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/current').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/fibres').should.be.equal(true)
    })
    it('should reject if loom does not exist', () => {
      pando.loom.load('test').should.be.rejected
    })
  })
  
  describe('#exists', async () => {
  
    before(async () => { loom = await pando.loom.new('test/mocks') })
  
    after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
  
    it('should return true if loom exists', () => {
      Loom.exists('test/mocks').should.be.equal(true)
    })
    it('should return false if loom does not exist', () => {
      Loom.exists('test/downloads').should.be.equal(false)
    })
  })
  
  describe('#stage', async () => {
  
    before(async () => { loom = await pando.loom.new('test/mocks') })
  
    after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
  
    it('should update loom\'s index stage fields correctly', async () => {
      let index = await loom.stage(['test/mocks/test.md', 'test/mocks/test-directory/test-1.md', 'test/mocks/test-directory/test-2.md', 'test/mocks/test-directory/test-subdirectory/test.md'])
      
      for (let path in cids) {
        index[path].stage.should.be.equal(cids[path])
      }    
    })
  })
  
  describe('#snapshot', async () => {
    let snapshot, index
    
    before(async () => {
      loom     = await pando.loom.new('test/mocks')
      index    = await loom.stage(['test/mocks/test.md', 'test/mocks/test-directory/test-1.md', 'test/mocks/test-directory/test-2.md', 'test/mocks/test-directory/test-subdirectory/test.md'])
      snapshot = await loom.snapshot('My first snapshot')
      index    = await loom.index.current
    })
  
    after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
    
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
  
  describe('FibreFactory', () => {
    let loom
    
    before(async () => {
      loom = await pando.loom.new('test/mocks')
    })
    
    after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
  
    describe('#new', () => {
      it('should initialize fibre correctly', async () => { 
        let aragon = await loom.fibre.new('aragon')
  
        aragon.name.should.be.equal('aragon')
        aragon.path.should.be.equal('test/mocks/.pando/fibres/aragon')
        // check that specimen is undefined
      })
      // it('should locally save new fiber object properly', () => {
      // 
      // })
    })
  
  })
  // 
  // describe('#load', () => {
  // 
  // })
  
})