import Commit, * as lib from '../scripts'
import IPLD from 'ipld'
import IPFS from 'ipfs-http-client'
import IPLDGit from 'ipld-git'
import { cidToSha } from 'ipld-git/src/util/util.js'
import CID from 'cids'
import chai from 'chai'
import dirtyChai from 'dirty-chai'
import multicodec from 'multicodec'

const expect = chai.expect
chai.use(dirtyChai)
const ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
const ipld = new IPLD({ blockService: ipfs.block, formats: [IPLDGit] })

describe('pando library', () => {
  let commit, commit2
  let commitBlob
  let commit2Blob
  let treeBlob

  let commitCid
  let commit2Cid
  let treeCid
  let blobCid

  let commitNode
  let commit2Node
  let treeNode
  let blobNode

  before( async () => {
    blobNode = Buffer.from('626c6f62203800736f6d6564617461', 'hex') // blob 8\0somedata
    blobCid = await IPLDGit.util.cid(blobNode)

    treeNode = {
      somefile: {
        hash: blobCid,
        mode: '100644'
      }
    }
    
    treeBlob = IPLDGit.util.serialize(treeNode)
    treeCid = await IPLDGit.util.cid(treeBlob)

    commitNode = {
      gitType: 'commit',
      tree: treeCid,
      parents: [],
      author: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '2017-06-12T23:22:12+02:00'
      },
      committer: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '2017-06-12T23:22:12+02:00'
      },
      message: 'Encoded\n'
    }

    commitBlob = IPLDGit.util.serialize(commitNode)
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
    
    commit2Blob = IPLDGit.util.serialize(commit2Node)
    commit2Cid = await IPLDGit.util.cid(commit2Blob)

    const nodes = [blobNode, treeNode, commitNode, commit2Node]
    const result = await ipld.putMany(nodes, multicodec.GIT_RAW)
    ;[blobCid, treeCid, commitCid, commit2Cid] = await result.all()
    commit = await lib.fetchCommit(commitCid)
    commit2 = await lib.fetchCommit(commit2Cid)
  })

  describe('instantiate Commit class', async () => {
    it('it has the correct cid and attributes', () => {
      expect(commit.cid).to.eql(commitCid)
      expect(commit.sha).to.eql(cidToSha(commitCid))
      expect(commit.author).to.eql(commitNode.author)
      expect(commit.committer).to.eql(commitNode.committer)
      expect(commit.message).to.eql(commitNode.message)
      expect(commit.parents).to.eql(commitNode.parents)
      expect(commit.tree).to.eql(commitNode.tree)
    })

    it('reorders parent commits to a descending date historical array', async (done) => {
      const history = await commit2.getOrderedHistory()
      expect(history[0].cid).to.be.eql(commit2Cid)
      expect(history[1].cid).to.be.eql(commitCid)
      done()
    })

    it('contains the tree with historical data about commiter and date modified', async (done) => {
      await commit.fetchModifiedTree()
      expect(commit.tree as lib.IModifiedTree).to.not.be.undefined
      expect(commit.tree as lib.IModifiedTree).to.not.be.empty

      for (const path in commit.tree) {
        expect(commit.tree[path].hasOwnProperty('lastEdit')).to.be.true
        expect(commit.tree[path].lastEdit.date).to.be.eql(commit.committer.date)
        expect(commit.tree[path].lastEdit.message).to.be.eql(commit.message)
      }
      done()
    })
    it('Can retrieve IPLD object from Commit', async () => {
      const ipldCommitObj = await lib.retrieveIPLDCommitObject(commit.cid)
      expect(ipldCommitObj).to.be.deep.equal(commitNode)
    })
  })
})
