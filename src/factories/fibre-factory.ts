import Pando      from '@pando'
import Loom       from '@components/loom'
import Fibre      from '@components/fibre'
import * as utils from '@locals/utils'
import path       from 'path'


export default class FibreFactory {
  
  public loom: Loom
  
  public constructor (_loom: Loom) {
    this.loom = _loom
  }
  
  public async new (_name: string, opts?: any): Promise < Fibre > {
    let fibre = await Fibre.new(this.loom, _name)

    await utils.yaml.write(fibre.path, { name: fibre.name, specimen: fibre.specimen ? fibre.specimen.address : 'undefined' , head: 'undefined' })
    
    return fibre
  }
  
  // public async load (_name: string, opts?: any) {
  // 
  // }
  
}