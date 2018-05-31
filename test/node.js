import Pando                              from '../lib/main.js'
import { Snapshot, Tree, File, Loom, IPLDNode } from '../lib/main.js'
import { opts, cids }                      from './data'
import * as utils                         from './utils'
import chai                               from 'chai'
import 'chai/register-should'

const should = chai.should
const expect = chai.expect

chai.use(require('chai-as-promised'))

describe('Node', () => {
  let pando, loom, index, snapshot
  
  before(async () => {
    pando    = new Pando(opts)
    loom     = await pando.loom.new('test/mocks')
    index    = await loom.stage(['test/mocks/test.md', 'test/mocks/test-directory/test-1.md', 'test/mocks/test-directory/test-2.md', 'test/mocks/test-directory/test-subdirectory/test.md'])
    snapshot = await loom.snapshot('My first snapshot')
  })
  
  after(async () => { await utils.fs.rmdir('test/mocks/.pando') })
  
  describe('#put', async () => {
    it('should push to ipfs/ipld correctly', async () => {
      let mocks        = { test: 'data' }
      let cid          = await loom.node.put(mocks)
      let downloaded   = await loom.node.get(cid)
    
      downloaded.should.be.deep.equal(mocks)
    })
  })
  
  describe('#get', async () => {
    it('should get from ipfs/ipld correctly', async () => {
      let mocks        = { test: 'data' }
      let cid          = await loom.node.put(mocks)
      let downloaded   = await loom.node.get(cid)
    
      downloaded.should.be.deep.equal(mocks)
    })
    it('should return plain object when no path is given', async () => {
      let mocks        = { test: 'data' }
      let cid          = await loom.node.put(mocks)
      let downloaded   = await loom.node.get(cid)
    
      downloaded.should.be.deep.equal(mocks)
    })
    it('should follow paths correctly', async () => {
      let cid          = await snapshot.cid()
      let downloaded   = await loom.node.get(cid, 'tree/test-directory/test-subdirectory')

      downloaded['@type'].should.be.equal('tree')
      downloaded.path.should.be.equal('test-directory/test-subdirectory')
    })
    
  })
  
})