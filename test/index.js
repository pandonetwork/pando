import Pando                              from '../lib/main.js'
import { Index, Loom } from '../lib/main.js'
import { opts, cids }                      from './data'
import * as utils                         from './utils'
import chai                               from 'chai'
import 'chai/register-should'

const should = chai.should
const expect = chai.expect

chai.use(require('chai-as-promised'))


describe('Index', async () => {
  let pando, loom
  
  before(async () => { 
    pando = new Pando(opts)
    loom  = await pando.loom.new('test/mocks')
  })
  
  after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
  
  describe('#new', async () => {
    it('should initialize index correctly', async () => {
      loom.index.loom.should.be.deep.equal(loom)
      loom.index.path.should.equal(loom.paths['index'])
    })
  })
  
  describe('#load', async () => {
    it('should initialize index correctly', async () => {
      let loaded = await pando.loom.load('test/mocks')
      let index  = await Index.load(loaded)
      index.loom.should.be.deep.equal(loaded)
      index.path.should.equal(loaded.paths['index'])
    })
  })

  describe('#update', async () => {
    it('should compute hashes properly', async () => {
      let index = await loom.index.update()
  
      for (let path in cids) {
        index[path].wdir.should.be.equal(cids[path])
      }
    })
    it('should update wdir field correctly when a file is modified', async () => {
      let content = utils.fs.read('test/mocks/test.md')
      let cid     = 'QmenBbcSZowrrBqPjpmH6LSXfLe7jtuxrQ8iGWdteTsNE9'
  
      utils.fs.write('test/mocks/test.md', 'This is a modified test file')
      let index = await loom.index.update()
      utils.fs.write('test/mocks/test.md', content)
  
      index['test.md'].wdir.should.be.equal(cid)
    })
    it('should update wdir field correctly when a file is added', async () => {
      let cid = 'QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX'
  
      utils.fs.write('test/mocks/test-2.md', 'This is a test file')
      let index = await loom.index.update()
      utils.fs.rm('test/mocks/test-2.md')
  
      index['test-2.md'].wdir.should.be.equal(cid)
    })
    it('should update wdir field correctly when a file is deleted', async () => {
      let content = utils.fs.read('test/mocks/test.md')
  
      utils.fs.rm('test/mocks/test.md')
      let index = await loom.index.update()
      utils.fs.write('test/mocks/test.md', content)
  
      index['test.md'].wdir.should.be.equal('null')
    })
  })

  describe('#staged', async () => {
    it('should return staged files correctly', async () => {  
      let index  = await loom.index.stage(['test/mocks/test.md', 'test/mocks/test-directory/test-1.md'])
      let staged = loom.index.staged
      
      staged[0].should.equal('test-directory/test-1.md')
      staged[1].should.equal('test.md')
      expect(staged[2]).to.not.exist
    })

  })
  
  describe('#stage', () => {
    it('should reject if file does not exist', () => {  
      loom.index.stage(['test/mocks/doesnotexist']).should.be.rejected     
    })
    it('should update stage fields correctly', async () => {
      let index = await loom.stage(['test/mocks/test.md', 'test/mocks/test-directory/test-1.md', 'test/mocks/test-directory/test-2.md', 'test/mocks/test-directory/test-subdirectory/test.md'])
      
      for (let path in cids) {
        index[path].stage.should.be.equal(cids[path])
      }    
    })
  })
  
})