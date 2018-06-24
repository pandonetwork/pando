import Pando        from '@pando'
import Node         from '@components/node'
import Index        from '@components/index'
import Fibre        from '@components/fibre'
import Snapshot     from '@objects/snapshot'
import Tree         from '@objects/tree'
import File         from '@objects/file'
import FibreFactory from '@factories/fibre-factory.ts'
import * as utils   from '@locals/utils'
import path         from 'path'
import CID          from 'cids'

export default class Loom {

  public static paths = {
    root:     '.',
    pando:    '.pando',
    ipfs:     '.pando/ipfs',
    index:    '.pando/index',
    current:  '.pando/current',
    fibres:   '.pando/fibres'
  }
  public pando:   Pando
  public node?:   Node
  public index?:  Index
  public fibre =  new FibreFactory(this)
  public paths =  { ...Loom.paths }

  public get head () {
    return utils.yaml.read(path.join(this.paths.fibres, utils.yaml.read(this.paths.current)))
  }

  public get currentBranchName (): string {
    return utils.yaml.read(this.paths.current)
  }
  
  public set currentBranchName (_name: string) {
    utils.yaml.write(this.paths.current, _name)
  }
  
  public get currentBranch (): Fibre {
    return Fibre.load(this, this.currentBranchName)
  }

  public constructor (_pando: Pando, _path: string = '.', opts?: any) {
    for (let p in this.paths) { this.paths[p] = path.join(_path, this.paths[p]) }
    this.pando = _pando
  }

  public static async new (_pando: Pando, _path: string = '.', opts?: any): Promise < Loom > {
    let loom = new Loom(_pando, _path)

    await utils.fs.mkdir(loom.paths.pando)
    await utils.fs.mkdir(loom.paths.ipfs)
    await utils.fs.mkdir(loom.paths.fibres)
    await utils.yaml.write(loom.paths.index, {})
    
    await Fibre.new(loom, 'master')
    await utils.yaml.write(loom.paths.current, 'master')
    

    loom.node  = await Node.new(loom)
    loom.index = await Index.new(loom)

    return loom
  }

  public static async load (_pando: Pando, _path: string = '.', opts?: any): Promise < Loom > {
    if (!Loom.exists(_path)) { throw new Error('No pando loom found at ' + _path) }

    let loom = new Loom(_pando, _path)
    loom.node  = await Node.load(loom)
    loom.index = await Index.load(loom)

    return loom
  }

  public static exists (_path: string = '.'): boolean {
    for (let p in Loom.paths) {
      let expected = path.join(_path, Loom.paths[p])
      if(!utils.fs.exists(expected)) { return false }
    }
    return true
  }

  public async stage (_paths: string[]): Promise < void > {
    return this.index!.stage(_paths)
  }

  public async snapshot (_message: string): Promise < Snapshot > {
    let tree    = await this.tree()
    let treeCID = await tree.put(this.node!)
    let parents = this.head !== 'undefined' ? [await this.fromIPLD(await this.node!.get(this.head))] : undefined
    
    let snapshot = new Snapshot({ author: this.pando.configuration.user, tree: tree, parents: parents, message: _message })
    let cid      = await this.node!.put(await snapshot.toIPLD())

    this.currentBranch.head = cid.toBaseEncodedString()

    return snapshot
  }

  public async checkout (_fibreName: string) {
    let baseTree, newTree
    
    await this.index!.update()
    
    //We check if the fibre exists
    if (!Fibre.exists(this, _fibreName)) {
      throw new Error('Fibre ' + _fibreName + ' does not exist')
    }
    if(this.index!.unsnapshot.length) {
      throw new Error('You have unsnapshot modifications: ' + this.index!.unsnapshot)
    }
    if(this.index!.modified.length) {
      throw new Error('You have unstaged and unsnaphot modifications: ' + this.index!.modified)
    }
        
    let newHead  = Fibre.head(this, _fibreName)
    let baseHead = this.head
    // On ne modifie le tree que s'il y a déjà eu des choses commités dans la branche sur laquelle on part
    if (newHead !== 'undefined') {
      newTree = await this.node!.get(newHead, 'tree')
      
      if (baseHead !== 'undefined') {
        baseTree = await this.node!.get(baseHead, 'tree')
      } else {
        baseTree = (new Tree({ path: '.', children: [] })).toIPLD()
      }

      await this.updateWorkingDirectory(baseTree, newTree)
      await this.index!.reinitialize(newTree)
    } else {
      await this.index!.reinitialize(await (new Tree({ path: '.', children: [] })).toIPLD())
    }
  
    this.currentBranchName = _fibreName
  }

  public async fromIPLD (object) {
    let attributes = {}, data = {}, node

    switch(object['@type']) {
      case 'snapshot':
        attributes = Reflect.getMetadata('ipld', Snapshot.prototype.constructor);
        break
      case 'tree':
        attributes = Reflect.getMetadata('ipld', Tree.prototype.constructor);
        break
      case 'file':
        attributes = Reflect.getMetadata('ipld', File.prototype.constructor);
        break
      default:
        throw new TypeError('Unrecognized IPLD node.')
    }

    for (let attribute in attributes) {
      if (attributes[attribute].link) {
        let type = attributes[attribute].type

        switch (type) {
          case 'map':
            data['children'] = {}
            for (let child in object) {
              if(child !== '@type' && child !== 'path') {
                data['children'][child] = await this.fromIPLD(await this.node!.get(object[child]['/']))
              }
            }
            break
          case 'array':
            data[attribute] = []
            for (let child of object[attribute]) {
              data[attribute].push(await this.fromIPLD(await this.node!.get(object[attribute][child]['/'])))
            }
            break
          case 'direct':
            data[attribute] = object[attribute]['/']
            break
          default:
            data[attribute] = await this.fromIPLD(await this.node!.get(object[attribute]['/']))
        }
      } else {
        data[attribute] = object[attribute]
      }
    }

    switch(object['@type']) {
      case 'snapshot':
        node = new Snapshot(data)
        break
      case 'tree':
        node = new Tree(data)
        break
      case 'file':
        node = new File(data)
        break
      default:
        throw new TypeError('Unrecognized IPLD node.')
    }

   return node
  }

  private tree () {
    let index  = this.index!.current
    let staged = this.index!.staged
    let tree   = new Tree({ path: '.' })

    for (let file of staged) {
      file.split(path.sep).reduce((parent, name): any => {
        let currentPath = path.join(parent.path!, name)
        if(!parent.children[name]) {
          if(index[currentPath]) {
            parent.children[name] = new File({ path: currentPath, link: index[currentPath].stage })
            index[currentPath].repo = index[currentPath].stage
          } else {
            parent.children[name] = new Tree({ path: currentPath })
          }
        }
        return parent.children[name]
      }, tree)
    }
    this.index!.current = index
    return tree
  }

  private async updateWorkingDirectory (_baseTree: any, _newTree: any) {
    // Delete meta properties to loop over tree's entries only
    delete _baseTree['@type']
    delete _baseTree['path']
    // Delete meta properties to loop over tree's entries only
    delete _newTree['@type']
    delete _newTree['path']
    
    for (let entry in _newTree) {
      if (!_baseTree[entry]) {
        // entry existing in newTree but not in baseTree
        await this.node!.download(_newTree[entry]['/'])
        delete _baseTree[entry]
      } else {
        // entry existing both in newTree and in baseTree
        if (_baseTree[entry]['/'] !== _newTree[entry]['/']) {
          let baseEntryType = await this.node!.get(_baseTree[entry]['/'], '@type')
          let newEntryType  = await this.node!.get(_newTree[entry]['/'], '@type')
          if (baseEntryType !== newEntryType) {
            // entry type differs in baseTree and newTree
            await this.node!.download(_newTree[entry]['/'])
          } else if (baseEntryType === 'file') {
            // entry type is the same in baseTree and newTree
            // entry is a file
            await this.node!.download(_newTree[entry]['/'])
          } else if (baseEntryType === 'tree') {
            // entry type is the same in baseTree and newTree
            // entry is a tree
            let baseEntry = await this.node!.get(_baseTree[entry]['/'])
            let newEntry  = await this.node!.get(_newTree[entry]['/'])
            await this.updateWorkingDirectory(baseEntry, newEntry) 
          }
        }
        delete _baseTree[entry]
      }
    }
    // Delete remaining files
    for (let entry in _baseTree) {
      let _path = await this.node!.get(_baseTree[entry]['/'], 'path')
      utils.fs.rm(path.join(this.paths.root, _path))
    }
  }
}
