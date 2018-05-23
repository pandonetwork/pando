export default class Snapshot {

  public type = 'snapshot'
  public cid:       string
  public timestamp: number
  public parents:   string[]
  public tree:      string
  public author:    string
  public message:   string
  
  public constructor (data: any, opts?: any) {
    this.cid        = data.cid
    this.author     = data.author
    this.tree       = data.tree
    this.parents    = data.parents
    this.message    = data.message
    this.timestamp  = Date.now()
  }
  
  public static new () {
    
  }

}
