import IPLD from 'ipld'
import IPFS from 'ipfs-http-client'
import IPLDGit from 'ipld-git'
import CID from 'cids'
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
        const tree = result.value
        for (let entry in tree) {
          const _path = path ? path + '/' + entry : entry
          if (tree[entry].mode === '40000') {
            const _files = await fetchFilesFromTree(tree[entry]['hash']['/'], _path)
            files = { ...files, ..._files }
          } else {
            files[_path].lastEdit = {
              date: tree[entry]['committer'].date,
              message: tree[entry]['message']
            }
            files[_path].mode = tree[entry].mode
            files[_path].blob = new CID(tree[entry]['hash']['/']).toBaseEncodedString()
          }
        }
        resolve(files as IModifiedTree)
      }
    })
  })
}

export const fetchHistory = async (hash:string, history: Commit[]): Promise<Commit[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const commit = await fetchCommit(hash)
      history.push(commit)

      for (let parent of commit.parents) {
        history = await fetchHistory(parent['/'], history)
      }

      resolve(history)
    } catch (err) {
      reject(err)
    }
  })
}

export const fetchCommit = async (hash: string): Promise<Commit> => {
  return new Promise((resolve, reject) => {
    try {
      const cid: string = new CID(hash)
      ipld.get(cid, async (err, result) => {
        if (err) {
          reject(err)
        } else {
          const IPLDCommit = result.value as ILinkedDataCommit
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
}

export const fetchOrderedHistory = async (hash: string, formerHistory: Commit[]) => {
  let history = await fetchHistory(hash, formerHistory)
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
  cid: string
  sha: string
  author: IAuthorOrCommitter
  committer: IAuthorOrCommitter
  message: string
  parents: ILinkedDataCommit[]
  tree: ITree | IModifiedTree | {}

  constructor(commit: ILinkedDataCommit) {
    if (commit.tree.hasOwnProperty('/')) {
      const _cid = new CID(commit.tree['/'])
      let _parents : ILinkedDataCommit[] = commit.parents ? 
        commit.parents.map(parent => (new CID(Object.values(parent)[0]).toBaseEncodedString)) : []
        this.cid = _cid
        this.sha = cidToSha(commit.tree['/']).toString('hex')
        this.author = commit.author
        this.committer = commit.committer
        this.message = commit.message
        this.tree = commit.tree
        this.parents = _parents
    }
  }

  public async fetchModifiedTree(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const files = await fetchFilesFromTree(this.tree['/'])
        this.tree = files
        resolve()
      } catch (err) {
        reject("Error")
      }
    })
    
  }

  public async getOrderdHistory(): Promise<Commit[]> {
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

//export function convertCommitToIPLDCommit(commit: Commit): ILinkedDataCommit {}


