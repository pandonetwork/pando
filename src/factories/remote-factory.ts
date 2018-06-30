import Loom from '@components/loom'
import Remote from '@components/remote'
import * as utils from '@utils'
import path from 'path'

export default class RemoteFactory {
  public loom: Loom

  public constructor(_loom: Loom) {
    this.loom = _loom
  }

  public async deploy(_name: string): Promise<Remote> {
    const { kernel, acl, tree } = await Remote.deploy(this.loom)
    this.saveAddress(_name, kernel.address)
    const remote = new Remote(this.loom, kernel, acl, tree, _name)
    console.log('on crée la branche remote master')
    const master = await this.loom.branch.new('master', { remote: _name })
    return remote
  }

  public async load(_name: string): Promise<Remote> {
    const address = this.loadAddress(_name)
    const { kernel, acl, tree } = await Remote.at(this.loom, address)

    return new Remote(this.loom, kernel, acl, tree, _name)
  }

  public async add(_name: string, _address: string): Promise<Remote> {
    const { kernel, acl, tree } = await Remote.at(this.loom, _address)
    this.saveAddress(_name, kernel.address)

    return new Remote(this.loom, kernel, acl, tree, _name)
  }

  public saveAddress(_name: string, _address: string): any {
    return utils.yaml.write(path.join(this.loom.paths.remotes, _name), _address)
  }

  public loadAddress(_name: string): any {
    return utils.yaml.read(path.join(this.loom.paths.remotes, _name))
  }
}
