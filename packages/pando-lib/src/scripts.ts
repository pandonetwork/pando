import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
import { cidToSha } from 'ipld-git/src/util/util.js'
import multicodec from 'multicodec'

const ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
const ipld = new IPLD({ blockService: ipfs.block, formats: [IPLDGit] })

export interface IAuthorOrCommitter {
  name: string
  email: string
  date: string
}

export interface ITree { [path: string]: string }

export interface ILinkedDataCommit {
  author: IAuthorOrCommitter
  committer: IAuthorOrCommitter
  message: string
  parents: CID[] | []
  tree: CID | IModifiedTree
  gitType: string
}

export interface IModifiedTree {
  [path: string]: { 
    mode: string | number
    blob:  CID
  }
}

export default class Commit {
  public author: IAuthorOrCommitter
  public committer: IAuthorOrCommitter
  public message: string
  public parents: CID[] | []
  public tree: CID
  public gitType: string

  constructor(commit: ILinkedDataCommit) {
    this.author = commit.author
    this.committer = commit.committer
    this.message = commit.message
    this.tree = commit.tree
    this.gitType = commit.gitType
    this.parents = commit.parents
  }

  public static async get(cid: CID): Promise<Commit> {
    return new Promise<Commit>(async (resolve, reject) => {
      try {
        let commit = await ipld.get(cid)
        commit = new Commit(commit)
        commit['@cid'] = cid
        commit['@sha'] = cidToSha(cid).toString('hex')
        resolve(commit)
      } catch (err) {
        reject(err)
      }
    })
  }

  public async put(): Promise<CID> {
    return new Promise<CID>(async (resolve, reject) => {
      try {
        let commitNode = {
          gitType: this.gitType,
          tree: this.tree,
          parents: this.parents,
          author: this.author,
          committer: this.committer,
          message: this.message
        }
        const commitBlob = IPLDGit.util.serialize(commitNode) // This is failing cause author / committer are null?
        const commitCid  = await IPLDGit.util.cid(commitBlob)

        const cid = await ipld.put(commitNode, multicodec.GIT_RAW)
        if (cid === commitCid) {
          resolve(cid)
        }
        else {
          throw(Error('CIDs are not the same...'))
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  public async extend(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let modifiedTree = {}
        let result = ipld.tree(this.tree, '', { recursive: true })
        const path = await result.first() // What to do if we get an array of paths...

        result = ipld.resolve(this.tree, path)
        let paths = await result.all()

        paths.map(file => {
          if (file.remainderPath === '') {
            modifiedTree[path] = file.value
          }

          //TODO: When there is a remainderPath, loop through, and add files, make fetchFiles function
        })

        this.tree = modifiedTree
        resolve()
      }
      catch(err) {
        reject(err)
      }
    })
  }
}