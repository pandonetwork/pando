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
    this.save(_name, remote)
    return remote
  }
  
  public async at (_name: string): Promise < Remote > {
    let info = this.load(_name)
       
    let remote = await Remote.at(this.loom, info.kernel, info.acl, info.tree, _name)
    return remote
  }

  public save (_name: string, _remote: Remote): any {
    let info = { kernel: _remote.kernel.address, acl: _remote.acl.address, tree: _remote.tree.address }
    utils.yaml.write(path.join(this.loom.paths.remotes, _name), info)  
    return info
  }

  public load (_name: string): any {    
    let info = utils.yaml.read(path.join(this.loom.paths.remotes, _name))
    return info
  }
}