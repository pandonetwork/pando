import CID from 'cids'
import { Commit, fetchOrderedHistory } from './commit'

export class Branch {
  public static async get(cid: CID): Promise<Branch> {
    try {
      const headCommit = await Commit.get(cid)
      const branch = new Branch(headCommit)

      return branch
    }
    catch (err) {
      throw(err)
    }
  }

  public head: Commit
  public history: Promise<Commit[]>
  constructor( _head: Commit ) {
    const orderedHistory = fetchOrderedHistory(_head['@cid'], [])
    this.head = _head
    this.history = orderedHistory
  }
}
