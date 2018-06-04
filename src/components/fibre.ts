import Loom     from '@components/loom'
import Snapshot from '@objects/snapshot'
import Specimen from '@components/specimen'
import path_    from 'path'

export default class Fibre {

  public loom:      Loom
  public name:      string
  public specimen?: Specimen

  public get path (): string {
    return path_.join(this.loom.paths.fibres, this.name)
  }

  public constructor (_loom: Loom, _name: string, opts?: any) {
    this.loom = _loom
    this.name = _name
  }

  public static async new (_loom: Loom, _name: string, opts?: any): Promise < Fibre > {
    //Check if Fibre doesnotexist.
    //Create a file in utils.yaml.write in fibres:   '.pando/fibres'
    //
    return new Fibre(_loom, _name)
  }

  // public async snapshot () : Promise < Snapshot > {
  //
  // }


  public async fetch () {

  }

  public async pull () {

  }

  public async revert () {

  }

  public get head (): string {
    return ''
  }

  public set head (_head: string) {
  }


}
