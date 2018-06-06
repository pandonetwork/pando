import Loom     from '@components/loom'
import Snapshot from '@objects/snapshot'
import Specimen from '@components/specimen'
import path    from 'path'
import * as utils   from '@locals/utils'

export default class Fibre {

  public loom:      Loom
  public name:      string
  public specimen?: Specimen

  public get path (): string {
    return path.join(this.loom.paths.fibres, this.name)
  }

  public constructor (_loom: Loom, _name: string, opts?: any) {
    this.loom = _loom
    this.name = _name
  }

  public static async new (_loom: Loom, _name: string, opts?: any): Promise < Fibre > {
    //check if the fibre with _name already exists
    if(utils.fs.exists(path.join(_loom.paths.fibres, _name))){
      throw new Error('Fibre already exists')
    }

    //Add the fibre to the fibrelist
    utils.yaml.write(path.join(_loom.paths.fibres,_name),'undefined')

    //First fibre created
    if(utils.yaml.read(_loom.paths.current) === 'undefined'){
      utils.yaml.write(_loom.paths.current,_name)
    }

    return new Fibre(_loom, _name)
  }

  public static async update (_loom: Loom, _name: string, opts?: any): Promise < Fibre > {

    utils.yaml.write(_loom.paths.current,_name)

    return new Fibre(_loom, _name)
  }


  public async fetch () {

  }

  public async pull () {
      // Get the tree.
      // Compare the tree with the current data structure.
      // Get the link of the file in the tree
      // Check if the file
      // If a local version of the file doesn't exist, download the file (create its folder if necessary)
      // TODO compare two trees
  }

  public async revert () {

  }

  public get head (): string {
    return ''
  }

  public set head (_head: string) {
  }


}
