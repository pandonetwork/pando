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
  
  public set head (_cid: string) {
    utils.yaml.write(this.path, _cid)
  }
  
  public get head () {
    return utils.yaml.read(this.path)
  }

  public constructor (_loom: Loom, _name: string, opts?: any) {
    this.loom = _loom
    this.name = _name
    this.head = 'undefined'
  }

  public static async new (_loom: Loom, _name: string, opts?: any): Promise < Fibre > {
    //check if the fibre with _name already exists
    if(Fibre.exists(_loom, _name)) {
      throw new Error('Fibre ' + _name + ' already exists')
    }

    //Add the fibre to the fibrelist
    // utils.yaml.write(path.join(_loom.paths.fibres,_name),'undefined')

    //First fibre created
    // if(utils.yaml.read(_loom.paths.current) === 'undefined'){
    //   utils.yaml.write(_loom.paths.current,_name)
    // }

    return new Fibre(_loom, _name)
  }
  
  public static load (_loom: Loom, _name: string, opts?: any): Fibre {
    //check if the fibre with _name already exists
    if(!Fibre.exists(_loom, _name)) {
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

  public static async update (_loom: Loom, _name: string, opts?: any): Promise < Fibre > {

    utils.yaml.write(_loom.paths.current,_name)

    return new Fibre(_loom, _name)
  }


  public async fetch () {

  }

  public async pull () {

  }

  public async revert () {

  }


}
