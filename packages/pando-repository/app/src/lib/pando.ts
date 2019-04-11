import { IPLD } from 'ipld'
import IPLDGit from 'ipld-git'
import { cidToSha } from 'ipld-git/src/util/util.js'
//const ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
//const ipld = new IPLD({ blockService: ipfs.block, formats: [IPLDGit] })

export interface IAuthorOrCommitter {
  name: string
  email: string
  date: string
}

export interface ITree { [path: string]: string }

export interface ILinkedDataCommit {
  author: AuthorOrCommiter
  committer: AuthorOrCommiter
  message: string
  parents: (ITree | string)[] | null
  tree: Tree
}

export default class Commit {
  constructor(commit: ILinkedDataCommit) {
    if (commit.tree.hasOwnProperty('/')) {
      Object.assign(this, commit, {
        cid: commit.tree['/'],
        sha: cidToSha(commit.tree['/'])
      });
    }
  }

  //public static async fetchOrderedHistory(formerHistory: (Commit | null)[]) {}
}

//public static async _fetchModifiedTree(commit: ILinkedDataCommit): Promise<ModifiedC

/** async function fetchModifiedTree(root: Tree): Promise<ModifiedTree> {
  //{ "/" : cid, "/": cid } ---> { "/": lastModified: { date: "datestr", author: "string"}, mode: "int", blob: cid }
  /**return new Promise<ModifiedTree>((resolve, reject) => {
    try {
      const cid = root["/"].cid

      ipld.get(cid, async (err, result) => {
        if (err) {
          reject(err)
        } else {

        }
      })
    } catch (err) {
      reject(err);
    }
  })
} **/

//export default fetchModifiedTree;
//export function convertCommitToIPLDCommit(commit: Commit): IPLDCommit {}


