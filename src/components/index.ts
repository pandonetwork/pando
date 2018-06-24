import Loom       from '@components/loom'
import * as utils from '@locals/utils'
import path       from 'path'
import klaw       from 'klaw-sync'


export default class Index {
  loom: Loom

  public get path () {
    return this.loom.paths.index
  }
  
  public get current () {
    return utils.yaml.read(this.path)
  }
  
  public set current (_index: any) {
    utils.yaml.write(this.path, _index)
  }
  
  public get unsnapshot (): string[] {
    let current       = this.current
    let staged: any[] = []
    
    for (let _path in current) {
      if (current[_path].repo !== current[_path].stage) {
        staged.push(_path)
      }
    }
    
    return staged
  }
  
  // Returns staged but unsnapshot files
  public get staged (): string[] {
    let current       = this.current
    let staged: any[] = []
    
    for (let _path in current) {
      // if (current[_path].repo !== current[_path].stage) {
      if (current[_path].stage !== 'null') {
        staged.push(_path)
      }
    }
    
    return staged
  }
  
  // Returns once staged files modified but not re-staged
  public get modified (): string[] {
    let current         = this.current
    let modified: any[] = []
    
    
    for (let _path in current) {
      if (current[_path].repo !== 'null' && current[_path].wdir !== current[_path].stage) {
        modified.push(_path)
      }
    }
    
    return modified
  }
  
  public get tracked (): string[] {
    return []
  }
  
  constructor (_loom: Loom) {
    this.loom = _loom
  }
  
  public static async new (_loom: Loom): Promise < Index > {
    return new Index(_loom)
  }
  
  public static async load (_loom: Loom): Promise < Index > {
    return new Index(_loom)
  }
  
  public async reinitialize (tree: any, _index?: any): Promise < any > {
    let index = _index || {}
    
    delete tree['@type']
    delete tree['path']
    
    for (let entry in tree) {
      let node = await this.loom.node!.get(tree[entry]['/'])      
      if (node['@type'] === 'tree') {
        await this.reinitialize(node, index)
      } else if (node['@type'] === 'file') {
        let cid = node.link['/']
        index[node.path] = { mtime: new Date(Date.now()), wdir: cid, stage: cid, repo: cid }
      }
    }
      
      
    this.current = index
    
  }
  
  public async update (): Promise < any > {
    let index   = this.current
    let files   = {}
    let filter  = item => item.path.indexOf('.pando') < 0 
    let listing = klaw(this.loom.paths.root, { nodir: true, filter: filter })
    
    for (let item in listing) {
      let _path = path.relative(this.loom.paths.root, listing[item].path)
      let _mtime = listing[item].stats.mtime
      files[_path] = { mtime: new Date(_mtime) }
    }
    
    let newFiles: any = Object.assign(files)
        
    for (let _path in index) {
      if (files[_path]) { // files at _path still exists
        if (new Date(index[_path].mtime) < files[_path].mtime) { // files at _path has been modified
          let cid = await this.loom.node!.cid(path.join(this.loom.paths.root, _path), { file: true })
          index[_path].mtime = files[_path].mtime
          index[_path].wdir = cid          
        }
      } else { // files at _path has been deleted
        index[_path].mtime = new Date(Date.now())
        index[_path].wdir = 'null'
      }
      delete newFiles[_path]
    }
    
    for (let _path in newFiles) { // file at _path has been added
      let cid = await this.loom.node!.cid(path.join(this.loom.paths.root, _path), { file: true })
      index[_path] = { mtime: files[_path].mtime, wdir: cid, stage: 'null', repo: 'null' }
    }
    
    this.current = index
    
    return index
  
  }
  
  public async stage (_paths: string[]): Promise < any > {
    let index = await this.update()
    
    for (let _path of _paths) {
      _path                     = path.normalize(_path)
      let relativePath          = path.relative(this.loom.paths.root, _path)
      let cid                   = await this.loom.node!.upload(_path)
      index[relativePath].stage = cid
    }
    
    this.current = index
    
    return index
  }
}