import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
import { cidToSha } from 'ipld-git/src/util/util.js'
import orderBy from 'lodash.orderby'
import uniqWith from 'lodash.uniqwith'
import multicodec from 'multicodec'

const ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
const ipld = new IPLD({ blockService: ipfs.block, formats: [IPLDGit] })

export const isEqualMultihash = (x: CID, y: CID): boolean => {
  return (x.toBaseEncodedString() === y.toBaseEncodedString()) && (x.version === y.version)
}

const fetchHistory = async (cid: CID, history: Commit[]): Promise<Commit[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const commit = await Commit.get(cid)
      history.push(commit)

      for (const parent of commit.parents) {
        history = await fetchHistory(parent, history)
      }

      resolve(history)
    } catch (err) {
      reject(err)
    }
  })
}

export const fetchOrderedHistory = async (cid: CID, formerHistory: Commit[]) => {
  let history = await fetchHistory(cid, formerHistory)
  history = uniqWith(history, (one, two) => {
    return isEqualMultihash(one['@cid'], two['@cid'])
  })

  history = orderBy(
    history,
    [
      commit => {
        // https://github.com/git/git/blob/v2.3.0/Documentation/date-formats.txt
        /* eslint-disable-next-line no-unused-vars */
        const [timestamp, offset] = commit.author.date.split(' ')
        return timestamp
      },
    ],
    ['desc']
  )

  return history
}

async function fetchFilesFromTree(path: string, cid: CID, treeObj: any): Promise<IModifiedTree> {
  return new Promise<IModifiedTree>( async (resolve, reject) => {
    try {
      const modifiedTree = treeObj ? treeObj : {}
      let result = ipld.tree(cid, path, { recursive: true })
      path = await result.first() // What to do if we get an array of paths...
    
      result = ipld.resolve(cid, path)
      const paths = await result.all()
    
      paths.map(file => {
        if (file.remainderPath === '') {
          modifiedTree[path] = { mode: file.value.mode, blob: file.value.hash }
        }
        else {
          fetchFilesFromTree(file.remainderPath, file.value, modifiedTree)
        }
      })
      resolve(modifiedTree)
    }
    catch(err) {
      reject(err)
    }
  })
}

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

export class Commit {
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

  public author: IAuthorOrCommitter
  public committer: IAuthorOrCommitter
  public message: string
  public parents: CID[] | []
  public tree: CID | IModifiedTree
  public gitType: string

  constructor(commit: ILinkedDataCommit) {
    this.author = commit.author
    this.committer = commit.committer
    this.message = commit.message
    this.tree = commit.tree
    this.gitType = commit.gitType
    this.parents = commit.parents
  }

  public async put(): Promise<CID> {
    return new Promise<CID>(async (resolve, reject) => {
      try {
        const commitNode = {
          author: this.author,
          committer: this.committer,
          gitType: this.gitType,
          message: this.message,
          parents: this.parents,
          tree: this.tree
        }
        const commitBlob = IPLDGit.util.serialize(commitNode)
        const commitCid  = await IPLDGit.util.cid(commitBlob)
      
        const cid = await ipld.put(commitNode, multicodec.GIT_RAW)
        if (isEqualMultihash(cid, commitCid)) {
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
        modifiedTree = await fetchFilesFromTree('', this.tree, modifiedTree)
        this.tree = modifiedTree
        resolve()
      }
      catch(err) {
        reject(err)
      }
    })
  }
}

export class Tree {
  public static async get(cid: CID): Promise<Tree> {
    return new Promise<Tree>(async (resolve, reject) => {
      try {
        let tree = await ipld.get(cid)
        tree = new Tree(tree)
        tree['@cid'] = cid
        tree['@sha'] = cidToSha(cid).toString('hex')
        resolve(tree)
      } catch (err) {
        reject(err)
      }
    })
  }

  public entries: IModifiedTree
  constructor( tree: IModifiedTree ) {
    this.entries = {}
    for (const file in tree) {
      if (tree.hasOwnProperty(file)) {
        this.entries[file] = tree[file]
      }
    }
  }

  public async put(): Promise<CID> {
    return new Promise<CID>(async (resolve, reject) => {
      try {
        const treeBlob = IPLDGit.util.serialize(this.entries)
        const treeCid  = await IPLDGit.util.cid(treeBlob)
      
        const cid = await ipld.put(this.entries, multicodec.GIT_RAW)

        if (isEqualMultihash(cid, treeCid)) {
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

  // What does extend do differently than commit's extend ?
}

export class Branch {
  public static async get(cid: CID): Promise<Branch> {
    return new Promise<Branch>(async (resolve, reject) => {
      try {
        const headCommit = await Commit.get(cid)
        const branch = new Branch(headCommit)

        resolve(branch)
      } catch (err) {
        reject(err)
      }
    })
  }

  public head: Commit
  public history: Promise<Commit[]>
  constructor( _head: Commit ) {
    const orderedHistory = fetchOrderedHistory(_head['@cid'], [])
    this.head = _head
    this.history = orderedHistory
  }
}