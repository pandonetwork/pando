import Pando  from '@pando'
import Loom   from '@components/loom'

export default class LoomFactory {
  public pando: Pando
  
  public constructor (_pando: Pando) {
    this.pando = _pando
  }
  
  public async new (_path: string = '.'): Promise < Loom > {
    return await Loom.new(this.pando, _path)  
  }
  
  public async load (_path: string = '.'): Promise < Loom > {
    return await Loom.load(_path)  
  }
}