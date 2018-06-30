import Loom from '@components/loom'
import Pando from '@pando'

export default class LoomFactory {
  public pando: Pando

  public constructor(_pando: Pando) {
    this.pando = _pando
  }

  public async create(_path: string = '.'): Promise<Loom> {
    return await Loom.new(this.pando, _path)
  }

  public async load(_path: string = '.'): Promise<Loom> {
    return await Loom.load(_path)
  }
}
