import Pando      from '../lib/main.js'
import { opts }   from './data'
import * as utils from './utils'
import chai       from 'chai'
import path         from 'path'

import 'chai/register-should'

const should = chai.should
const expect = chai.expect

chai.use(require('chai-as-promised'))

describe('Pando', () => {
  let pando

  describe('#new', () => {
    it('should initialize pando correctly', () => {
      pando = new Pando(opts)
      pando.configuration.author.should.be.equal(opts.author)
      pando.configuration.ethereum.should.be.equal(opts.ethereum)
    })
  })

  describe('LoomFactory', () => {
    let loom

    before(async () => { loom = await pando.loom.new(path.join('test','mocks')) })

    after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })

    describe('#new', () => {
      it('should initialize loom\'s paths correctly', () => {
        loom.paths.root.should.be.equal(path.join('test','mocks'))
        loom.paths.pando.should.be.equal(path.join('test','mocks','.pando'))
        loom.paths.ipfs.should.be.equal(path.join('test','mocks','.pando','ipfs'))
        loom.paths.index.should.be.equal(path.join('test','mocks','.pando','index'))
        loom.paths.current.should.be.equal(path.join('test','mocks','.pando','current'))
        loom.paths.branches.should.be.equal(path.join('test','mocks','.pando','branches'))
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
        utils.fs.exists(path.join('test','mocks','.pando','branches')).should.be.equal(true)
      })
    })

    describe('#load', async () => {
      let loaded

      before(async () => {
        loaded = await pando.loom.load(path.join('test','mocks'))
      })

      after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })

      it('should initialize loom\'s paths correctly', () => {
        loaded.paths.root.should.be.equal(path.join('test','mocks'))
        loaded.paths.pando.should.be.equal(path.join('test','mocks','.pando'))
        loaded.paths.ipfs.should.be.equal(path.join('test','mocks','.pando','ipfs'))
        loaded.paths.index.should.be.equal(path.join('test','mocks','.pando','index'))
        loaded.paths.current.should.be.equal(path.join('test','mocks','.pando','current'))
        loaded.paths.branches.should.be.equal(path.join('test','mocks','.pando','branches'))
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
        utils.fs.exists(path.join('test','mocks','.pando','branches')).should.be.equal(true)
      })
      it('should reject if loom does not exist', () => {
        pando.loom.load('test').should.be.rejected
      })
    })

  })

})
