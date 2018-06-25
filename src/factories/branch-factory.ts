import Pando  from '@pando'
import Loom   from '@components/loom'
import Branch from '@components/branch'


export default class BranchFactory {
  public loom: Loom
  
  public constructor (_loom: Loom) {
    this.loom = _loom
  }
  
  public async new (_name: string, opts?: any): Promise < Branch > {
    return await Branch.new(this.loom, _name)
  }
}