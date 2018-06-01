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

export default class Loom {
  
  public static paths = {
    root:     '.',
    pando:    '.pando',
    ipfs:     '.pando/ipfs',
    index:    '.pando/index',
    current:  '.pando/current',
    fibres:   '.pando/fibres'
  }
  public pando:         Pando
  public node?:         Node
  public index?:        Index
  public workingFibre?: Fibre
  public fibre =        new FibreFactory(this)
  public paths =        { ...Loom.paths }
  
  public constructor (_pando: Pando, _path: string = '.', opts?: any) {
    for (let p in this.paths) { this.paths[p] = path.join(_path, this.paths[p]) }
    this.pando = _pando
  }
  
  public static async new (_pando: Pando, _path: string = '.', opts?: any) : Promise < Loom > {
    let loom = new Loom(_pando, _path)
        
    await utils.fs.mkdir(loom.paths.pando)
    await utils.fs.mkdir(loom.paths.ipfs)
    await utils.fs.mkdir(loom.paths.fibres)
    await utils.yaml.write(loom.paths.index, {})
    await utils.yaml.write(loom.paths.current, 'undefined')
    
    loom.node  = await Node.new(loom)
    loom.index = await Index.new(loom)

    return loom
  }
  
  public static async load (_pando: Pando, _path: string = '.', opts?: any) : Promise < Loom > {
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
    let tree     = await this.tree()
    let treeCID  = await tree.put(this.node!)
    let snapshot = new Snapshot({ author: this.pando.configuration.user, tree: tree, parents: undefined, message: _message }) // à terme il faut mettre à jour le parent
    let cid      = await this.node!.put(await snapshot.toIPLD())

    return snapshot
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
  
  // private
  public tree () {
    let index  = this.index!.current
    let staged = this.index!.staged
    let tree   = new Tree({ path: '.' })
    
    for (let file of staged) {
      file.split('/').reduce((parent, name): any => {
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
  
  // public async checkout (_fibreName: string) {
  // git checkout restore old files from the branch except for new files which have not been added. Evite de niquer les nodes modules, etc.
  // si on checkout alors que y'a des modifications non commités dans des fichiers déjà présents dans l'index, ça lève une alerte.
  // A voir comment on gère dans l'index la question de la suppression des fichiers. Est-ce qu'on supprime pas tout simplement l'entrée ?
  // https://stackoverflow.com/questions/12087946/git-how-does-git-remember-the-index-for-each-branch
  // }
  // 
  // public async weave (_originFibreName: string, _destinationFibreName: string) {
  // 
  // }
  // 
  // public async revert (_snapshotCID: string) {
  // 
  // } 
}