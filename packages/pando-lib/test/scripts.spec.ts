import Commit from '../src/scripts'
import IPLD from 'ipld'
import IPFS from 'ipfs-http-client'
import IPLDGit from 'ipld-git'
import { cidToSha } from 'ipld-git/src/util/util.js'
import chai from 'chai'
import dirtyChai from 'dirty-chai'
import multicodec from 'multicodec'

const expect = chai.expect
chai.use(dirtyChai)
const ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
const ipld = new IPLD({ blockService: ipfs.block, formats: [IPLDGit] })

describe('pando library', () => {
  let blobNode
  let treeNode
  let commitNode
  let commit2Node

  let blobCid
  let treeCid
  let commitCid
  let commit2Cid

  before( async () => {
    blobNode = Buffer.from('626c6f62203800736f6d6564617461', 'hex') // blob 8\0somedata
    blobCid = await IPLDGit.util.cid(blobNode)

    treeNode = {
      somefile: {
        hash: blobCid,
        mode: '100644'
      }
    }

    const treeBlob = IPLDGit.util.serialize(treeNode)
    treeCid = await IPLDGit.util.cid(treeBlob)

    commitNode = {
      gitType: 'commit',
      tree: treeCid,
      parents: [],
      author: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '1497302532 +0200'
      },
      committer: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '1497302532 +0200'
      },
      message: 'Initial commit\n'
    }

    const commitBlob = IPLDGit.util.serialize(commitNode)
    commitCid = await IPLDGit.util.cid(commitBlob)

    commit2Node = {
      gitType: 'commit',
      tree: treeCid,
      parents: [
        commitCid
      ],
      author: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '1497302533 +0200'
      },
      committer: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '1497302533 +0200'
      },
      message: 'Change nothing\n'
    }
    
    const commit2Blob = IPLDGit.util.serialize(commit2Node)
    commit2Cid = await IPLDGit.util.cid(commit2Blob)

    const nodes = [blobNode, treeNode, commitNode, commit2Node]
    const result = ipld.putMany(nodes, multicodec.GIT_RAW)
    ;[blobCid, treeCid, commitCid, commit2Cid] = await result.all()
  })

  describe('> Commit class', () => {
    describe('# static get(cid) method - retrieves commit', () => {
      it('retreives commit node with correct cid', async () => {
        const cid = await ipld.put(commitNode, multicodec.GIT_RAW)

        commitNode['@cid'] = cid
        commitNode['@sha'] = cidToSha(cid).toString('hex')

        const node = await Commit.get(cid)
        expect(node).to.deep.equal(commitNode)
      })
      it('retreives commit node with parents', async () => {
        const cid = await ipld.put(commit2Node, multicodec.GIT_RAW)

        commit2Node['@cid'] = cid
        commit2Node['@sha'] = cidToSha(cid).toString('hex')

        const node = await Commit.get(cid)
        expect(node).to.deep.equal(commit2Node)
      })
    })
    describe('# put() method', () => {
      it('serializes Commit class and uploads it to ipfs', async () => {
        const cid = await ipld.put(commitNode, multicodec.GIT_RAW)
        const node = await Commit.get(cid)

        const newCid = await node.put()

        expect(newCid).to.deep.equal(cid)
      })
    })
    describe('# extend() method', () => {
      it('recurses through the tree and return paths with cids', async () => {
        const cid = await ipld.put(commitNode, multicodec.GIT_RAW)
        const node = await Commit.get(cid)

        await node.extend()
        expect(node.tree).to.deep.equal(treeNode)
      })
    })
  })
})
