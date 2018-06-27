import Loom   from '@components/loom'
import Remote from '@components/remote'
import * as utils from '@locals/utils'
import path from 'path'

export default class RemoteFactory {
  public loom: Loom 
  
  public constructor (_loom: Loom) {
    this.loom = _loom
  }

  public async deploy (_name: string): Promise < Remote > {    
    let remote = await Remote.deploy(this.loom, _name)
    this.saveInformations(_name, remote)
    return remote
  }
  
  public async load (_name: string): Promise < Remote > {
    let info = this.loadInformations(_name)
       
    let remote = await Remote.at(this.loom, info.kernel, info.acl, info.tree, _name)
    return remote
  }

  public saveInformations (_name: string, _remote: Remote): any {
    let info = { kernel: _remote.kernel.address, acl: _remote.acl.address, tree: _remote.tree.address }
    utils.yaml.write(path.join(this.loom.paths.remotes, _name), info)  
    return info
  }

  public loadInformations (_name: string): any {    
    let info = utils.yaml.read(path.join(this.loom.paths.remotes, _name))
    return info
  }
}