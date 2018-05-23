import Pando  from '@pando'
import Loof   from '@components/loom'

export default class LoomFactory {
  
  public pando: Pando
  
  public constructor (_pando: Pando) {
    this.pando = _pando
  }
  
  public async new (_path: string = '.', opts?: any): Promise < Loof > {
    return await Loof.new(this.pando, _path)  
  }
  
  public async load (_path: string = '.', opts?: any): Promise < Loof > {
    return await Loof.load(this.pando, _path)  
  }
  
}