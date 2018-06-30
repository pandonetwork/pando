import Branch from '@components/branch'
import Loom from '@components/loom'
import * as utils from '@utils'
import path from 'path'

export default class RemoteBranch {
  public loom: Loom
  public remote: string
  public name: string

  public get path(): string {
    return path.join(this.loom.paths.branches, this.nameLong)
  }

  public get head(): string {
    return utils.yaml.read(this.path)
  }

  public set head(_cid: string) {
    utils.yaml.write(this.path, _cid)
  }

  public get nameLong(): string {
    return this.remote + ':' + this.name
  }

  public constructor(_loom: Loom, _name: string, _remote: string) {
    this.loom = _loom
    this.name = _name
    this.remote = _remote
    this.head = utils.fs.exists(this.path) ? this.head : 'undefined'
  }

  public static new(_loom: Loom, _name: string, _remote: string): Branch {
    // let name = _remote + ':' + _name
    if (RemoteBranch.exists(_loom, _name, _remote)) {
      throw new Error('Branch ' + _name + ' already exists')
    }

    return new RemoteBranch(_loom, _name, _remote)
  }

  public static load(_loom: Loom, _name: string, _remote: string): Branch {
    // let name = _remote + ':' + _name
    if (!RemoteBranch.exists(_loom, _name, _remote)) {
      throw new Error('Branch ' + _remote + ':' + _name + ' does not exist')
    }

    return new RemoteBranch(_loom, _name, _remote)
  }
  //
  public static exists(_loom: Loom, _name: string, _remote: string): boolean {
    console.log('test')
    console.log(_remote + ':' + _name)
    return utils.fs.exists(
      path.join(_loom.paths.branches, _remote + ':' + _name)
    )
  }

  public static head(_loom: Loom, _name: string, _remote: string): string {
    return utils.yaml.read(
      path.join(_loom.paths.branches, _remote + ':' + _name)
    )
  }
}
