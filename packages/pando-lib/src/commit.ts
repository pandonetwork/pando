import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
import { cidToSha } from 'ipld-git/src/util/util.js'
import orderBy from 'lodash.orderby'
import uniqWith from 'lodash.uniqwith'
import multicodec from 'multicodec'

export const ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
export const ipld = new IPLD({ blockService: ipfs.block, formats: [IPLDGit] })

export interface IAuthorOrCommitter {
  name: string
  email: string
  date: string
}

export interface IIPLDCommit {
  author: IAuthorOrCommitter
  committer: IAuthorOrCommitter
  message: string
  parents: CID[] | []
  tree: CID | IExtendedTree
  gitType: string
  encoding: string
  object?: CID
  tag?: string
  type?: string
}

export interface IExtendedTree {
  [path: string]: {
    mode: string | number
    blob:  CID
  }
}

export const SERIALIZED_MULTIHASH_ERROR: Error = new Error('Serialized object does not share the CID provided prior to upload to IPFS')

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

async function fetchFilesFromTree(path: string, cid: CID, treeObj: any): Promise<IExtendedTree> {
  return new Promise<IExtendedTree>( async (resolve, reject) => {
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

export class Commit {
  public static async get(cid: CID): Promise<Commit> {
    try {
      let commit = await ipld.get(cid)
      commit = new Commit(commit)
      commit['@cid'] = cid
      commit['@sha'] = cidToSha(cid).toString('hex')
      return commit
    } catch (err) {
      throw(err)
    }
  }

  public author: IAuthorOrCommitter
  public committer: IAuthorOrCommitter
  public message: string
  public parents: CID[]
  public tree: CID | IExtendedTree
  public gitType: string
  public encoding: string
  public object: CID
  public tag: string
  public type: string

  constructor(commit: IIPLDCommit) {
    this.author = commit.author
    this.committer = commit.committer
    this.message = commit.message
    this.tree = commit.tree
    this.gitType = commit.gitType
    this.parents = commit.parents
    this.encoding = commit.encoding

    if (commit.gitType === 'tag') {
      this.object = commit.object
      this.tag = commit.tag
      this.type = commit.type
    }
  }

  public async put(): Promise<CID> {
    try {
      const commitNode: IIPLDCommit = {
        author: this.author,
        committer: this.committer,
        encoding: this.encoding,
        gitType: this.gitType,
        message: this.message,
        parents: this.parents,
        tree: this.tree,
      }

      if (this.gitType === 'tag') {
        commitNode.object = this.object
        commitNode.tag = this.tag
        commitNode.type = this.type
      }

      const commitBlob = IPLDGit.util.serialize(commitNode)
      const commitCid  = await IPLDGit.util.cid(commitBlob)

      const cid = await ipld.put(commitNode, multicodec.GIT_RAW)
      if (isEqualMultihash(cid, commitCid)) {
        return cid.toBaseEncodedString()
      }
      else {
        throw(SERIALIZED_MULTIHASH_ERROR)
      }
    } catch (err) {
      throw(err)
    }
  }

  public async extend(): Promise<void> {
    try {
      let modifiedTree = {}
      modifiedTree = await fetchFilesFromTree('', this.tree, modifiedTree)
      this.tree = modifiedTree
    }
    catch(err) {
      throw(err)
    }
  }
}
