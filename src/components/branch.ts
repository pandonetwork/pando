import Loom       from '@components/loom'
import * as utils from '@locals/utils'
import path       from 'path'


export default class Branch {
  public loom:      Loom
  public name:      string

  public get path (): string {
    return path.join(this.loom.paths.branches, this.name)
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

  public static new (_loom: Loom, _name: string, opts?: any): Branch{
    if (Branch.exists(_loom, _name)) {
      throw new Error('Branch ' + _name + ' already exists')
    }

    return new Branch(_loom, _name)
  }
  
  public static load (_loom: Loom, _name: string, opts?: any): Branch {
    if (!Branch.exists(_loom, _name)) {
      throw new Error('Branch ' + _name + ' does not exist')
    }

    return new Branch(_loom, _name)
  }
  
  public static exists (_loom: Loom, _name: string): boolean {
    return utils.fs.exists(path.join(_loom.paths.branches, _name))
  }
  
  public static head (_loom: Loom, _name: string): string {
    return utils.yaml.read(path.join(_loom.paths.branches, _name))
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
