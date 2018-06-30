import Loom from '@components/loom'
import * as utils from '@utils'
import path from 'path'

export default class Branch {
  public static async new(
    loom: Loom,
    name: string,
    opts?: any
  ): Promise<Branch> {
    if (Branch.exists(loom, name)) {
      throw new Error('Branch ' + name + ' already exists')
    }

    return new Branch(loom, name)
  }

  public static load(loom: Loom, name: string, opts?: any): Branch {
    if (!Branch.exists(loom, name)) {
      throw new Error('Branch ' + name + ' does not exist')
    }

    return new Branch(loom, name)
  }

  public static exists(loom: Loom, name: string): boolean {
    return utils.fs.exists(path.join(loom.paths.branches, name))
  }

  public static head(loom: Loom, name: string): string {
    return utils.yaml.read(path.join(loom.paths.branches, name))
  }

  public loom: Loom
  public name: string
  public remote?: string

  public get path(): string {
    return path.join(this.loom.paths.branches, this.name)
  }

  public get head(): string {
    return utils.yaml.read(this.path)
  }

  public set head(cid: string) {
    utils.yaml.write(this.path, cid)
  }

  public constructor(loom: Loom, name: string) {
    this.loom = loom
    this.name = name
    this.head = utils.fs.exists(this.path) ? this.head : 'undefined'
  }
}
