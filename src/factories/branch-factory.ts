import Branch       from '@components/branch'
import Loom         from '@components/loom'
import RemoteBranch from '@components/remote-branch'

export default class BranchFactory {
  public loom: Loom
  
  public constructor (_loom: Loom) {
    this.loom = _loom
  }
  
  public async new (_name: string, opts?: any): Promise < Branch > {
    if (opts && opts.remote) {
      return await RemoteBranch.new(this.loom, _name, opts.remote)
    } else {
      return await Branch.new(this.loom, _name)
    }
  }
  
  public async load (_name: string, opts?: any): Promise < Branch > {
    if (opts && opts.remote) {
      return await RemoteBranch.load(this.loom, _name, opts.remote)
    } else {
      return await Branch.load(this.loom, _name)
    }
  }
}