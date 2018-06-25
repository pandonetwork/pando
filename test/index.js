import Pando           from '../lib/main.js'
import { Index, Loom } from '../lib/main.js'
import { opts, cids }  from './data'
import * as utils      from './utils'
import * as fs         from 'fs-extra'
import chai            from 'chai'
import path            from 'path'

import 'chai/register-should'

const should = chai.should
const expect = chai.expect

chai.use(require('chai-as-promised'))

describe('Index', async () => {
  let pando, loom

  before(async () => {
    pando = new Pando(opts)
    loom  = await pando.loom.new(path.join('test','mocks'))
  })

  after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })

  describe('#new', async () => {
    it('should initialize index correctly', async () => {
      
      loom.index.loom.should.be.deep.equal(loom)
      loom.index.path.should.equal(loom.paths.index)
    })
  })

  describe('#load', async () => {
    it('should initialize index correctly', async () => {
      let loaded = await pando.loom.load(path.join('test','mocks'))
      let index  = await Index.load(loaded)
      
      index.loom.should.be.deep.equal(loaded)
      index.path.should.equal(loaded.paths.index)
    })
  })
  
  describe('#staged', async () => {
    it('should return staged files correctly', async () => {
      let index  = await loom.index.stage([path.join('test','mocks','test.md'), path.join('test','mocks','test-directory','test-1.md')])
      let staged = loom.index.staged

      staged[0].should.equal(path.join('test-directory','test-1.md'))
      staged[1].should.equal('test.md')
      expect(staged[2]).to.not.exist
    })
  })
  
  describe('#unsnapshot', async () => {    
    it('should return unspnashot files correctly', async () => {
      let index     = await loom.index.stage([path.join('test','mocks','test.md'), path.join('test','mocks','test-directory','test-1.md')])
      let unsnapshot = loom.index.unsnapshot

      unsnapshot[0].should.equal(path.join('test-directory','test-1.md'))
      unsnapshot[1].should.equal('test.md')
      expect(unsnapshot[2]).to.not.exist
    })
  })
  
  describe('#modified', async () => {
    after(() => {
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
    
    it('should return modified files correctly', async () => {
      await loom.index.stage([path.join('test','mocks','test.md')])
      utils.fs.write(path.join('test','mocks','test.md'), 'This is a modified test file')
      await loom.index.update()
      
      let modified = loom.index.modified

      modified[0].should.equal('test.md')
      expect(modified[1]).to.not.exist
    })
  })
  
  describe('#update', async () => {
    
    before(async () => {
      await utils.fs.rmdir(path.join('test','mocks','.pando')) 
      pando = new Pando(opts)
      loom  = await pando.loom.new(path.join('test','mocks'))
    })
    
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
    
    it('should compute hashes properly', async () => {
      let index = await loom.index.update()

      for (let path in cids) {
        index[path].wdir.should.be.equal(cids[path])
      }
    })
    
    it('should update wdir field correctly when a file is modified', async () => {
      let cid     = 'QmenBbcSZowrrBqPjpmH6LSXfLe7jtuxrQ8iGWdteTsNE9'
      utils.fs.write(path.join('test','mocks','test.md'), 'This is a modified test file')
      let index = await loom.index.update()

      index['test.md'].wdir.should.be.equal(cid)
    })
    
    it('should update wdir field correctly when a file is added', async () => {
      let cid = 'QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX'
      utils.fs.write(path.join('test','mocks','test-2.md'), 'This is a test file')
      let index = await loom.index.update()

      index['test-2.md'].wdir.should.be.equal(cid)
    })
    
    it('should update wdir field correctly when a file is deleted', async () => {
      utils.fs.rm(path.join('test','mocks','test.md'))
      let index = await loom.index.update()

      index['test.md'].wdir.should.be.equal('null')
    })
  })

  describe('#stage', () => {
    afterEach(() => {
      if (utils.fs.exists(path.join('test','mocks','test.md'))) {
        utils.fs.rm(path.join('test','mocks','test.md'))
      }
      if (utils.fs.exists(path.join('test','mocks','test-2.md'))) {
        utils.fs.rm(path.join('test','mocks','test-2.md'))
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
    
    it('should reject if file does not exist in neither working directory nor index', () => {
      loom.index.stage([path.join('test','mocks','doesnotexist')]).should.be.rejected
    })
    
    it('should update stage fields correctly if file does exist', async () => {
      let index = await loom.stage([path.join('test','mocks','test.md'), path.join('test','mocks','test-directory','test-1.md'), 'test/mocks/test-directory/test-2.md', 'test/mocks/test-directory/test-subdirectory/test.md'])

      for (let _path in cids) {
        index[_path].stage.should.be.equal(cids[_path])
      }
    })
    
    it('should remove entry if file has been deleted', async () => {
      utils.fs.rm(path.join('test','mocks','test.md'))
      let index = await loom.stage([path.join('test','mocks','test.md')])
      
      expect(index['test.md']).to.be.undefined
    })    
  })
})
