import Pando                              from '../lib/main.js'
import { Snapshot, Tree, File, IPLDNode } from '../lib/main.js'
import { opts }                           from './data'
import * as utils                         from './utils'
import chai                               from 'chai'
import path         from 'path'

import 'chai/register-should'

const should = chai.should
const expect = chai.expect

chai.use(require('chai-as-promised'))


describe('IPLD Nodes', () => {
  let pando, loom, index, snapshot, tree, file

  before(async () => {
    pando     = new Pando(opts)
    loom      = await pando.loom.new(path.join('test','mocks'))
    index     = await loom.index.stage([path.join('test','mocks','test.md'), path.join('test','mocks','test-directory','test-1.md')])
    snapshot  = await loom.snapshot('My first snapshot')
    tree      = await snapshot.tree
    file      = await tree.children['test.md']
  })

  after(async () => { await utils.fs.rmdir(path.join('test','mocks','.pando')) })

  describe('Snapshot', async () => {
    describe('#constructor', async () => {
      it('should initialize snapshot correctly', async () => {
        snapshot.type.should.equal('snapshot')
        snapshot.tree.should.deep.equal(tree)
        snapshot.author.should.deep.equal(opts.user)
        snapshot.message.should.equal('My first snapshot')
        snapshot.parents.should.deep.equal([])
        // snapshot.timestamp ?
      })
    })
    describe('IPLD (de)serialization', async () => {
      it('should round-trip (de)serialization correctly', async () => {
        let serialized = await snapshot.toIPLD()
        let deserialized = await loom.fromIPLD(serialized)

        deserialized.should.deep.equal(snapshot)
      })
    })
  })

  describe('Tree', async () => {
    describe('#constructor', async () => {
      it('should initialize tree correctly', async () => {
        tree.path.should.equal('.')
        tree.children['test.md'].type.should.equal('file')
        tree.children['test.md'].path.should.equal('test.md')
        tree.children['test.md'].link.should.equal('QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX')
        tree.children['test-directory'].type.should.equal('tree')
        tree.children['test-directory'].path.should.equal('test-directory')
      })
    })
    describe('IPLD (de)serialization', async () => {
      it('should round-trip (de)serialization correctly', async () => {
        let serialized = await tree.toIPLD()
        let deserialized = await loom.fromIPLD(serialized)

        deserialized.should.deep.equal(tree)
      })
    })
  })

  describe('File', async () => {
    describe('#constructor', async () => {
      it('should initialize file correctly', async () => {
        file.type.should.equal('file')
        file.path.should.equal('test.md')
        file.link.should.equal('QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX')
      })
    })
    describe('IPLD (de)serialization', async () => {
      it('should round-trip (de)serialization correctly', async () => {
        let serialized = await file.toIPLD()
        let deserialized = await loom.fromIPLD(serialized)

        deserialized.should.deep.equal(file)
      })
    })
  })

})
