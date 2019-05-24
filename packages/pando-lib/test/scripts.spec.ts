import { Commit, Tree, Branch, isEqualMultihash } from '../src/scripts'
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

  before(async () => {
    blobNode = Buffer.from('626c6f62203800736f6d6564617461', 'hex') // blob 8\0somedata
    blobCid = await IPLDGit.util.cid(blobNode)

    treeNode = {
      somefile: {
        hash: blobCid,
        mode: '100644',
      },
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
        date: '2017-06-12T23:22:12+02:00',
      },
      committer: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '2017-06-12T23:22:12+02:00',
      },
      encoding: 'ISO-8859-1',
      message: 'Initial commit\n',
    }

    const commitBlob = IPLDGit.util.serialize(commitNode)
    commitCid = await IPLDGit.util.cid(commitBlob)

    commit2Node = {
      gitType: 'commit',
      tree: treeCid,
      parents: [commitCid],
      author: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '2017-06-12T23:22:12+02:00',
      },
      committer: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        date: '2017-06-12T23:22:12+02:00',
      },
      encoding: 'ISO-8859-1',
      message: 'Change nothing\n',
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
    describe('# put() method - upload to ipfs', () => {
      it('serializes Commit class and uploads it to ipfs', async () => {
        const cid = await ipld.put(commitNode, multicodec.GIT_RAW)
        const node = await Commit.get(cid)

        const newCidString = await node.put()

        expect(newCidString).to.deep.equal(cid.toBaseEncodedString())
      })
    })
    describe('# extend() method - get files from tree', () => {
      it('recurses through the tree and return paths with cids', async () => {
        const cid = await ipld.put(commitNode, multicodec.GIT_RAW)
        const node = await Commit.get(cid)

        await node.extend()
        expect(node.tree).to.deep.equal({ // Test existing tree node with renamed field
          'somefile': {
            blob: blobCid,
            mode: '100644'
          }
        })
      })
    })
  })

  describe('> Tree class', () => {
    describe('# static get(cid) method - retrieves commit', () => {
      it('retreives tree node with correct cid', async () => {
        const cid = await ipld.put(treeNode, multicodec.GIT_RAW)
        const node = await Tree.get(cid)

        expect(node.entries.somefile).to.deep.equal(treeNode['somefile'])
      })
    })
    describe('# put() method - upload to ipfs', () => {
      it('serializes Tree class and uploads it to ipfs', async () => {
        const cid = await ipld.put(treeNode, multicodec.GIT_RAW)
        const node = await Tree.get(cid)

        const newCidString = await node.put()

        expect(newCidString).to.deep.equal(cid.toBaseEncodedString())
      })
    })
  })
  
  describe('> Branch class', () => {
    describe('# static get(cid) method - retrieves commit', () => {
      it('retreives commit node with correct cid as the head', async () => {
        const cid = await ipld.put(commit2Node, multicodec.GIT_RAW)
        const node = await Branch.get(cid)

        //Expand commit object
        commit2Node['@cid'] = cid
        commit2Node['@sha'] = cidToSha(cid).toString('hex')
        expect(node.head).to.deep.equal(commit2Node)
      })
    })
    describe('# Ordered history', () => {
      it('returns an array of commits in historical order from the head', async () => {
        const cid = await ipld.put(commit2Node, multicodec.GIT_RAW)
        const node = await Branch.get(cid)

        const headCid = node.head['@cid']
        expect(headCid).to.deep.equal(cid)

        const orderedHistory = await node.history
        
        // HEAD commit is correct
        const lastestCommit = orderedHistory[0]
        expect(isEqualMultihash(lastestCommit.parents[0], commitCid)).to.be.true

        // Commits are in the right order
        for (let i = 1; i < orderedHistory.length; i++) {
          const current = new Date(orderedHistory[i].author.date)
          const prev = new Date(orderedHistory[i-1].author.date)
          const isOlder = current < prev
          expect(isOlder).to.be.true
        }
      })
    })
  })
})
