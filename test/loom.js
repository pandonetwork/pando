const assert = require('assert')
const fs = require('fs');
var should = require('chai').should;

var expect = require('chai').expect;


const chai = require('chai');
chai.use(require('chai-as-promised'));

import 'chai/register-should';
import Pando from '../lib/main.js'
import * as utils from './utils'

const opts = {
  user: {
    account: '0x2d6ef21eb58f164841b41a7b749d0d957790620a'
  },
  ethereum: {
    gateway: 'http://localhost:8545'
  }
}

describe('Loom', () => {
  
  let pando, loom
  
  before(() => { pando = new Pando(opts) })
  
  describe('#new', async () => {
    
    before(async () => { loom = await pando.loom.new('test/mocks') })
    
    after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
    
    it('should init loom\'s paths properly', () => {
      loom.paths.root.should.be.equal('test/mocks')
      loom.paths.pando.should.be.equal('test/mocks/.pando')
      loom.paths.ipfs.should.be.equal('test/mocks/.pando/ipfs')
      loom.paths.index.should.be.equal('test/mocks/.pando/index')
      loom.paths.current.should.be.equal('test/mocks/.pando/current')
      loom.paths.fibres.should.be.equal('test/mocks/.pando/fibres')
    })
    
    it('should init index properly', () => {
    })
    
    it('should init node properly', () => {
    })
    
    it('should init .pando directory structure properly', () => {
      utils.fs.exists('test/mocks/.pando').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/ipfs').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/index').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/current').should.be.equal(true)
      utils.fs.exists('test/mocks/.pando/fibres').should.be.equal(true)
    })
  
    
  })
  
  describe('#load', async () => {
    
    before(async () => { loom = await pando.loom.new('test/mocks') })
    
    after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
    
    it('should init loom\'s paths properly', async () => {
      let loaded = await pando.loom.load('test/mocks')
      
      loaded.paths.root.should.be.equal('test/mocks')
      loaded.paths.pando.should.be.equal('test/mocks/.pando')
      loaded.paths.ipfs.should.be.equal('test/mocks/.pando/ipfs')
      loaded.paths.index.should.be.equal('test/mocks/.pando/index')
      loaded.paths.current.should.be.equal('test/mocks/.pando/current')
      loaded.paths.fibres.should.be.equal('test/mocks/.pando/fibres')
    })
    
    it('should reject if loom does not exist', () => {
      pando.loom.load('test').should.be.rejected
    })
  
  })
  
  describe('Index', async () => {
    
    before(async () => { loom = await pando.loom.new('test/mocks') })
    
    // after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
    
    describe('#new', async () => {
      
      it('should init index\'s paths properly', async () => {
        
      })
      
    })
    
    describe('#update', async () => {
      
      it('should compute hashes properly', async () => {
        
        const cids = {
          'test-directory/test-1.md': 'QmTC9KZuuF1tJ69ruoA2Cm9quGBZiL663Ahb4wJnUAPSRn',
          'test-directory/test-2.md': 'QmfAE9AGw3snCsmDqArUCGYGvqNpee3RKM5BcB7e3qyjgS',
          'test-directory/test-subdirectory/test.md': 'QmaRMPXt4R9mWgkVR8DvBBwxJsAMUZdNV9mvSvtPUe6Ccc',
          'test.md': 'QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX'
        }
        
        let index = await loom.index.update()
        
        for (let path in cids) {
          index[path].wdir.should.be.equal(cids[path])
        }
                
      })
      
      it('should update wdir field when a file is modified', async () => {
        let content = utils.fs.read('test/mocks/test.md')
        let cid     = 'QmenBbcSZowrrBqPjpmH6LSXfLe7jtuxrQ8iGWdteTsNE9'

        utils.fs.write('test/mocks/test.md', 'This is a modified test file')
        let index = await loom.index.update()
        utils.fs.write('test/mocks/test.md', content)
    
        index['test.md'].wdir.should.be.equal(cid)
      })
      
      it('should update wdir field when a file is added', async () => {
        let cid = 'QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX'
    
        utils.fs.write('test/mocks/test-2.md', 'This is a test file')
        let index = await loom.index.update()
        utils.fs.rm('test/mocks/test-2.md')
    
        index['test-2.md'].wdir.should.be.equal(cid)
      })
      
      it('should update wdir field when a file is deleted', async () => {
        let content = utils.fs.read('test/mocks/test.md')
        
        utils.fs.rm('test/mocks/test.md')
        let index = await loom.index.update()
        utils.fs.write('test/mocks/test.md', content)

        index['test.md'].wdir.should.be.equal('null')
      })
      
    })
    
    describe('#stage', () => {
      
      it('should reject if file does not exist', () => {  
        loom.index.stage(['test/mocks/doesnotexist']).should.be.rejected     
      })
      
      it('should update stage field properly', async () => {
        let index = await loom.index.stage(['test/mocks/test.md'])
    
        index['test.md'].stage.should.be.equal('QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX')
      })
    })
  })
  
  // describe('FibreFactory', () => {
  //   let loom
  //   before(async () => {
  //     loom = await pando.loom.new('test/mocks')
  //   })
  // 
  //   describe('#new', () => {
  //     it('should init new fibre object properly', async () => { 
  //       let aragon = await loom.fibre.new('aragon')
  // 
  //       aragon.name.should.be.equal('aragon')
  //       aragon.path.should.be.equal('test/mocks/.pando/fibres/aragon')
  //       // check that specimen is undefined
  //     })
  //     it('should locally save new fiber object properly', () => {
  // 
  //     })
  //   })
  // 
  // })
  // 
  // describe('#load', () => {
  // 
  // })
  
})