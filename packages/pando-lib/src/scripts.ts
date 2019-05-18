import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
import { cidToSha } from 'ipld-git/src/util/util.js'
import orderBy from 'lodash.orderby'
import uniqWith from 'lodash.uniqwith'

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
  parents: ILinkedDataCommit[] | null
  tree: ITree
}

export interface IModifiedTree {
  [path: string]: { 
    lastEdit: { 
      date: string 
      message: string
    } 
    mode: string | number
    blob:  string
  }
}

export const fetchFilesFromTree = (hash: string, path?: string) => {
  return new Promise(async (resolve, reject) => {
    let files = {}
    const cid = new CID(hash)

    ipld.get(cid, async (err, result) => {
      if (err) {
        reject(err)
      } else {
        let tree = result.value as ITree
        for (const entry in tree) {
          if (entry) {
            const _path = path ? path + '/' + entry : entry
            if (tree[entry]['mode'] === '40000') {
              const _files = await fetchFilesFromTree(tree[entry]['hash']['/'], _path)
              files = { ...files, ..._files }
            } else {
              files[_path] = {
                mode: tree[entry]['mode'], 
                blob: new CID(tree[entry]['hash']['/']).toBaseEncodedString()}
            }
          }
        }
        resolve(files as IModifiedTree)
      }
    })
  })
}

export const fetchHistory = async (cid: CID, history: Commit[]): Promise<Commit[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const commit = await fetchCommit(cid)
      history.push(commit)

      for (const parent of commit.parents) {
        history = await fetchHistory(parent['/'], history)
      }

      resolve(history)
    } catch (err) {
      reject(err)
    }
  })
}

export const fetchCommit = async (cid: CID): Promise<Commit> => {
  return new Promise((resolve, reject) => {
    try {
      ipld.get(cid, async (err, result) => {
        if (err) {
          reject(err)
        } else {
          const IPLDCommit = result.value as ILinkedDataCommit
          const commit = new Commit(IPLDCommit)
          commit.cid = cid
          await commit.fetchModifiedTree()
          resolve(commit)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

export const fetchOrderedHistory = async (cid: CID, formerHistory: Commit[]) => {
  let history = await fetchHistory(cid, formerHistory)
  history = uniqWith(history, (one, two) => {
    return one.cid === two.cid
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

export default class Commit {
  public cid: string
  public sha: string
  public author: IAuthorOrCommitter
  public committer: IAuthorOrCommitter
  public message: string
  public parents: ILinkedDataCommit[]
  public tree: ITree | IModifiedTree | {}

  constructor(commit: ILinkedDataCommit) {

    if (commit) {
      if (commit.tree.hasOwnProperty('/')) {
        const _cid = new CID(commit.tree['/'])
        const _parents : ILinkedDataCommit[] = commit.parents ? 
          commit.parents.map(parent => (new CID(Object.values(parent)[0]).toBaseEncodedString())) : []
          this.cid = _cid
          this.sha = cidToSha(commit.tree['/']).toString('hex')
          this.author = commit.author
          this.committer = commit.committer
          this.message = commit.message
          this.tree = commit.tree
          this.parents = _parents
      }
    }
  }

  public async fetchModifiedTree(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        let files = await fetchFilesFromTree(this.tree['/'])
        for (const path in files) {
          files[path] = { 
            lastEdit: { date: this.committer.date, message: this.message},
            ...files[path]
          }
        }
        this.tree = files
        resolve()
      } catch (err) {
        reject("Error")
      }
    })
    
  }

  public async getOrderedHistory(): Promise<Commit[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const orderedHistory = await fetchOrderedHistory(this.cid, [])
        resolve(orderedHistory)
      } catch (err) {
        reject(err)
      }
    })
  }
}

export function retrieveIPLDCommitObject(commit: Commit): Promise<ILinkedDataCommit>{
  const commitCid = commit.cid
  return new Promise((resolve, reject) => {
    try {
      ipld.get(commitCid, async (err, result) => {
        if (err) {
          reject(err)
        } else {
          const IPLDCommit = result.value as ILinkedDataCommit
          resolve(IPLDCommit)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}