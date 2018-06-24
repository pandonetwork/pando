import Loom     from '@components/loom'
import Snapshot from '@objects/snapshot'
import Specimen from '@components/specimen'
import Tree         from '@objects/tree'

import path    from 'path'
import * as utils   from '@locals/utils'

export default class Fibre {

  public loom:      Loom
  public name:      string
  public specimen?: Specimen

  public get path (): string {
    return path.join(this.loom.paths.fibres, this.name)
  }
  
  public get head (): string {
    return utils.yaml.read(this.path)
  }
  
  public set head (_cid: string) {
    utils.yaml.write(this.path, _cid)
  }
  
  public constructor (_loom: Loom, _name: string) {
    this.loom = _loom
    this.name = _name
    this.head = utils.fs.exists(this.path) ? this.head : 'undefined'
  }

  public static new (_loom: Loom, _name: string, opts?: any): Fibre {
    if (Fibre.exists(_loom, _name)) {
      throw new Error('Fibre ' + _name + ' already exists')
    }

    return new Fibre(_loom, _name)
  }
  
  public static load (_loom: Loom, _name: string, opts?: any): Fibre {
    if (!Fibre.exists(_loom, _name)) {
      throw new Error('Fibre ' + _name + ' does not exist')
    }

    return new Fibre(_loom, _name)
  }
  
  public static exists (_loom: Loom, _name: string): boolean {
    return utils.fs.exists(path.join(_loom.paths.fibres, _name))
  }
  
  public static head (_loom: Loom, _name: string): string {
    return utils.yaml.read(path.join(_loom.paths.fibres, _name))
  }

  // public async fetch () {
  // 
  // }
  // 
  // public async pull () {
  // 
  // }
  // 
  // public async revert () {
  // 
  // }

}
