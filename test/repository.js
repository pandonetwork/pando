const assert = require('assert')
const fs = require('fs');
var should = require('chai').should;

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

describe('Pando', () => {
  describe('#new', () => {
    it('should init pando object properly', () => {
      let pando = new Pando(opts)
      pando.configuration.user.should.be.equal(opts.user)
      pando.configuration.ethereum.should.be.equal(opts.ethereum)      
    })
  })
  describe('#load', () => {
    it('should init pando object properly', () => {
      // let pando = new Pando.load(opts)
      // pando.configuration.user.should.be.equal(opts.user)
      // pando.configuration.ethereum.should.be.equal(opts.ethereum)      
    })
  })
  
  // describe('RepositoryFactory', () => {
  // 
  //   describe('#create', () => {
  // 
  //     let pando, repository
  // 
  //     before(async () => {
  //       pando = new Pando(opts)
  //       repository = await pando.repository.create('test/mocks')
  //     })
  // 
  //     after(async () => {
  //       await utils.fs.rmdir('test/mocks/.pando')
  //     })
  // 
  //     it('should init repository paths properly', async () => {
  //       let paths = repository.paths
  // 
  //       paths['root'].should.be.equal('test/mocks')
  //       // remplir la suite
  //     })
  // 
  //     it('should init .pando folder properly', async () => {
  //       let paths = repository.paths
  //       for (let path in paths) {
  //         utils.fs.exists(paths[path]).should.be.true
  //       }
  //     })
  // 
  //   })
  // 
  //   describe('#load', () => {
  //     it('should init properly', () => {
  // 
  // 
  //     })
  //   })
  // 
  //   describe('#clone', () => {
  //     it('should init properly', () => {
  // 
  // 
  //     })
  //   })
  // 
  // })
  
  describe('Repository', () => {
    
    // describe('#updateIndex()', () => {
    // 
    //   let pando, repository
    // 
    //   before(async () => {
    //     pando = new Pando(opts)
    //     repository = await pando.repository.create('test/mocks')
    //   })
    // 
    //   after(async () => {
    //     await utils.fs.rmdir('test/mocks/.pando')
    //     // repository.index = index
    //   })
    // 
    //   it('should compute wdir field properly', async () => {
    // 
    // 
    //     const cids = {
    //       'test/mocks/test-directory/test-1.md':'QmTC9KZuuF1tJ69ruoA2Cm9quGBZiL663Ahb4wJnUAPSRn',
    //       'test/mocks/test-directory/test-2.md':'QmfAE9AGw3snCsmDqArUCGYGvqNpee3RKM5BcB7e3qyjgS',
    //       'test/mocks/test-directory/test-subdirectory/test.md': 'QmaRMPXt4R9mWgkVR8DvBBwxJsAMUZdNV9mvSvtPUe6Ccc',
    //       'test/mocks/test.md': 'QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX'
    //     }
    // 
    //     await repository.updateIndex()
    //     let index = repository.index
    // 
    //     for (let path in cids) {
    //       index[path].wdir.should.be.equal(cids[path])
    //     }
    // 
    //   })
    // 
    //   it('should update wdir field when a file is modified', async () => {        
    //     let content = utils.fs.read('test/mocks/test.md')
    //     let cid = 'QmenBbcSZowrrBqPjpmH6LSXfLe7jtuxrQ8iGWdteTsNE9'
    // 
    //     utils.fs.write('test/mocks/test.md', 'This is a modified test file')
    //     await repository.updateIndex()
    //     let index = repository.index
    //     utils.fs.write('test/mocks/test.md', content)
    // 
    //     index['test/mocks/test.md'].wdir.should.be.equal(cid)
    // 
    //   })
    // 
    //   it('should update wdir field when a file is added', async () => {
    //     let cid = 'QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX'
    // 
    //     utils.fs.write('test/mocks/test-2.md', 'This is a test file')
    //     await repository.updateIndex()
    //     let index = repository.index
    //     utils.fs.rm('test/mocks/test-2.md')
    // 
    //     index['test/mocks/test-2.md'].wdir.should.be.equal(cid)
    //   })
    // 
    //   it('should update wdir field when a file is deleted', async () => {        
    //     let content = utils.fs.read('test/mocks/test.md')
    //     utils.fs.rm('test/mocks/test.md')
    //     await repository.updateIndex()
    //     let index = repository.index
    //     utils.fs.write('test/mocks/test.md', content)
    // 
    //     index['test/mocks/test.md'].wdir.should.be.equal('null')
    // 
    //   })
    // })
    // 
    // describe('#add()', () => {
    // 
    // 
    //   let pando, repository
    // 
    //   before(async () => {
    //     pando = new Pando(opts)
    //     repository = await pando.repository.create('test/mocks')
    //   })
    // 
    //   after(async () => {
    //     await utils.fs.rmdir('test/mocks/.pando')
    //   })
    // 
    // 
    //   it('should throw if file does not exist', () => {        
    //   })
    //   it('should update stage field if file does exist', async () => {
    // 
    //     await repository.add(['test/mocks/test.md'])
    // 
    //     let index = repository.index
    // 
    //     index['test/mocks/test.md'].stage.should.be.equal('QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX')
    // 
    // 
    //   })
    // })
    // 
    
    describe('#tree()', () => {
      
      let pando, repository
      
      before(async () => {
        pando = new Pando(opts)
        console.log('initialize 1')
        repository = await pando.repository.create('test/mocks')
      })
      
      after(async () => {
        await utils.fs.rmdir('test/mocks/.pando')
      })
      
      it('should build tree from paths properly', async () => {
        
        let paths = ['test/sub/test1.md', 'test/sub/test2.md', 'test/test.md']
        let tree = repository.tree(paths)
  
        tree[0].path.should.equal('.')
        tree[0].children[0].path.should.equal('test')
        tree[0].children[0].children[0].path.should.equal('test/sub')
        tree[0].children[0].children[1].path.should.equal('test/test.md')
        tree[0].children[0].children[0].children[0].path.should.equal('test/sub/test1.md')
        tree[0].children[0].children[0].children[1].path.should.equal('test/sub/test2.md') 
      })
    })
    
    describe('#commit()', () => {
    
      let pando, repository
    
      before(async () => {
        pando = new Pando(opts)
        console.log('initialize 2')
        repository = await pando.repository.create('test/mocks')
      })
    
      after(async () => {
        await utils.fs.rmdir('test/mocks/.pando')
      })
    
      it('should throw if file does not exist', async () => {
    
    
    
    
      })
      it('should upload commit object properly', async () => {
        await repository.add(['test/mocks/test-directory/test-subdirectory/test.md', 'test/mocks/test-directory/test-2.md'])
        
        let cid = await repository.commit('First commit')
        let commit = await repository.satellizer.get(cid)

        commit['@type'].should.equal('commit')
        commit.author.should.equal(opts.user.account)
        commit.message.should.equal('First commit')
        
        
         // await repository.download(commit.tree['/'], 'test/downloads')
        
        
      })
      
    })
    
    
    describe('#log', () => {
    
      let pando, repository
    
      before(async () => {
        pando = new Pando(opts)
        console.log('initialize 3')
        repository = await pando.repository.create('test/mocks')
      })
    
      after(async () => {
        await utils.fs.rmdir('test/mocks/.pando')
      })
    
      it('should list commit objects properly', async () => {
        await repository.add(['test/mocks/test-directory/test-subdirectory/test.md', 'test/mocks/test-directory/test-2.md'])
        let cid1 = await repository.commit('Added test-directory/test-subdirectory/test.md and test-directory/test-2.md')
        
        await repository.add(['test/mocks/test.md'])
        let cid2 = await repository.commit('Added test.md')
        
        let commits = await repository.log()
      })
      
    })
    
    describe('#push', () => {
    
      let pando, repository
    
      before(async () => {
        pando = new Pando(opts)
        console.log('initialize 3')
        repository = await pando.repository.create('test/mocks')
      })
    
      after(async () => {
        await utils.fs.rmdir('test/mocks/.pando')
      })
    
      it('should push head cid properly', async () => {
        await repository.add(['test/mocks/test-directory/test-subdirectory/test.md', 'test/mocks/test-directory/test-2.md'])
        let cid1 = await repository.commit('Added test-directory/test-subdirectory/test.md and test-directory/test-2.md')
        
        await repository.add(['test/mocks/test.md'])
        let cid2 = await repository.commit('Added test.md')
        
        let tx = await repository.push()
        console.log(tx)
        
        let cid3 = await repository.dao.head()
        
        cid3.should.equal(cid2)
        
      })
      
    })
    
    
  })
})