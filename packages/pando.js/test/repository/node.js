/* eslint-disable import/no-duplicates */
import Pando from '../../lib/pando.js'
import { Repository } from '../../lib/pando.js'
/* eslint-enable import/no-duplicates */
import { opts, cids } from '../data'
import chai from 'chai'
import npath from 'path'
import 'chai/register-should'

chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))

describe('Repository#Node', () => {
  let pando, repository, snapshot

  before(async () => {
    pando = await Pando.create(opts)
    repository = await pando.repositories.create(npath.join('test', 'mocks'))
    await repository.stage([
      npath.join('test', 'mocks', 'test.md'),
      npath.join('test', 'mocks', 'test-directory', 'test-1.md'),
      npath.join('test', 'mocks', 'test-directory', 'test-2.md'),
      npath.join(
        'test',
        'mocks',
        'test-directory',
        'test-subdirectory',
        'test.md'
      )
    ])
    snapshot = await repository.snapshot('My first snapshot')
  })

  after(async () => {
    await Repository.remove(npath.join('test', 'mocks'))
  })

  describe('#put', async () => {
    it('should push to ipfs/ipld correctly', async () => {
      let mocks = { test: 'data' }
      let cid = await repository.node.put(mocks)
      let downloaded = await repository.node.get(cid)

      downloaded.should.be.deep.equal(mocks)
    })
  })

  describe('#get', async () => {
    it('should get from ipfs/ipld correctly', async () => {
      let mocks = { test: 'data' }
      let cid = await repository.node.put(mocks)
      let downloaded = await repository.node.get(cid)

      downloaded.should.be.deep.equal(mocks)
    })
    it('should return plain object when no path is given', async () => {
      let mocks = { test: 'data' }
      let cid = await repository.node.put(mocks)
      let downloaded = await repository.node.get(cid)

      downloaded.should.be.deep.equal(mocks)
    })
    it('should follow paths correctly', async () => {
      let cid = await snapshot.cid()
      let downloaded = await repository.node.get(
        cid,
        'tree/test-directory/test-subdirectory'
      )

      downloaded['@type'].should.be.equal('tree')
      downloaded.path.should.be.equal(
        npath.join('test-directory', 'test-subdirectory')
      )
    })
  })

  describe('#upload', async () => {
    let cid, downloaded

    it('should compute cid correctly', async () => {
      cid = await repository.node.upload(npath.join('test', 'mocks', 'test.md'))

      cid.should.equal(cids['test.md'])
    })
    it('should upload file to IPFS correctly', async () => {
      downloaded = await repository.node.get(cid)

      downloaded
        .toJSON()
        .data.toString()
        .should.equal('\b\u0002\u0012\u0013This is a test file\u0018\u0013')
    })
    it('should reject if file does not exist', async () => {
      repository.node.upload('doesnotexist').should.be.rejected()
    })
  })
})
