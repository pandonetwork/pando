export default class Snapshot {
  
//   '@type': 'commit',
//   'timestamp': Date.now(),
//   'parents': parents,
//   'tree':  { '/' : tree.cid },
//   'author': this.pando.configuration.user.account,
//   'message': _message
// }  
  
  public type = 'commit'
  public timestamp: number
  public parents: string[]
  // public tree = Tree
  author: string
  message: string
  hashtags: string[]
  
  public constructor (data: any, opts?: any) {
    this.author = data.author
    this.parents = data.parents
    this.message = data.message
    this.hashtags = data.hashtags
    this.timestamp = Date.now()
  }
  
}
