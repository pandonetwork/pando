import Commit, * as lib from './scripts'
import IPLD from 'ipld'
import IPFS from 'ipfs-http-client'
import IPLDGit from 'ipld-git'
import CID from 'cids'
const ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
const ipld = new IPLD({ blockService: ipfs.block, formats: [IPLDGit] })

describe('pando library', () => {
    //const existingCommitHash
    //let ipldCommit
    //const formerHistory
    let ipldCommit;

    beforeEach( async () => {
        //fetch the commit by a known hash already uploaded
        let commitPromise = new Promise((resolve, reject) => {
          try {
            const cid: string = new CID('zdpuAmoZixxJjvosviGeYcqduzDhSwGV2bL6ZTTXo1hbEJHfq')
            ipld.get(cid, async (err, result) => {
              if (err) {
                reject(err)
              } else {
                const IPLDCommit = result.value as lib.ILinkedDataCommit
                let commit = new Commit(IPLDCommit)
                commit.cid = cid
                await commit.fetchModifiedTree()
                resolve(commit)
              }
            })
          } catch (err) {
            reject(err)
          }
        })
        console.log(commitPromise)
    })
    test('generate Commit object with correct attributes', () => {
        const commit = new Commit(ipldCommit)

        it('it has the correct cid associated to the hash', () => {
            //const cid = new CID(existingCommitHash)
            //expect(commit.cid).toEqual(cid)
            //expect(commit.sha).toEqual(cidToSha(existingCommitHash))
        })

        it('reorders parent commits to a descending date historical array', () => {
            //create a new commit and compare the history with the previous commit / new one and ensure the new one is the first item
        })
        it('contains the tree with historical data about authors and date modified', () => {
            //await commit.fetchModifiedTree
            //assert that each object contains dateModified field and is of interface IModifiedTree
        })

        it('can publish the new commit object to ipfs', () => {
            //ipld.get based the commit hash, convert to Commit class, then reupload to ipfs with the new hash
            //assert equal the sha for ipld and the Commit.sha
        })
    })
    test('Upack Commit object to ipld commit', () => {
        //fetch the ipld object based on the hash
        // assert equal ipld object === convertCommitToIPLDCommit(commit)
    })
})
