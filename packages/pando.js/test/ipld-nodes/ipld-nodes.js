/* eslint-disable import/no-duplicates */
import Pando from '../../lib/pando.js'
import { Repository } from '../../lib/pando.js'
/* eslint-enable import/no-duplicates */
import { opts } from '../data'
import chai from 'chai'
import npath from 'path'
import 'chai/register-should'

chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))

describe('IPLD Nodes', () => {
  let pando, repository, snapshot, tree, file

  before(async () => {
    pando = await Pando.create(opts)
    repository = await pando.repositories.create(npath.join('test', 'mocks'))
    await repository.stage([
      npath.join('test', 'mocks', 'test.md'),
      npath.join('test', 'mocks', 'test-directory', 'test-1.md')
    ])
    snapshot = await repository.snapshot('My first snapshot')
    tree = snapshot.tree
    file = tree.children['test.md']
  })

  after(async () => {
    await Repository.remove(npath.join('test', 'mocks'))
  })

  describe('Snapshot', async () => {
    describe('#constructor', async () => {
      it('should initialize snapshot correctly', async () => {
        snapshot.type.should.equal('snapshot')
        snapshot.tree.should.deep.equal(tree)
        snapshot.author.should.deep.equal(opts.author)
        snapshot.message.should.equal('My first snapshot')
        snapshot.parents.should.deep.equal([])
        // snapshot.timestamp ?
      })
    })
    describe('IPLD (de)serialization', async () => {
      it('should round-trip (de)serialization correctly', async () => {
        // let serialized = await snapshot.toIPLD()
        let cid = await snapshot.cid()
        let deserialized = await repository.fromCID(cid)

        // let deserialized = await repository.fromIPLD(serialized)
        // console.log('tfromIPLD')
        // console.log(deserialized)
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
        tree.children['test.md'].link.should.equal(
          'QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX'
        )
        tree.children['test-directory'].type.should.equal('tree')
        tree.children['test-directory'].path.should.equal('test-directory')
      })
    })
    describe('IPLD (de)serialization', async () => {
      it('should round-trip (de)serialization correctly', async () => {
        // let serialized = await tree.toIPLD()
        let cid = await tree.cid()
        let deserialized = await repository.fromCID(cid)

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
        let cid = await file.cid()
        let deserialized = await repository.fromCID(cid)

        deserialized.should.deep.equal(file)
      })
    })
  })
})
