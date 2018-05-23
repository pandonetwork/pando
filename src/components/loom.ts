import Pando        from '@pando'
import Node         from '@components/node'
import Index        from '@components/index'
import Fibre        from '@components/fibre'
import FibreFactory from '@factories/fibre-factory.ts'
import * as utils   from '@locals/utils'
import path         from 'path'

export default class Loom {
  
  public static         paths = {
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
    if (!Loom.exists(_path)) { throw new Error('No pando repository found at ' + _path) }
    
    let loom = new Loom(_pando, _path)

    // loom.node  = await Node.load(loom)
    loom.index = await Index.new(loom)
    
    return new Loom(_pando, _path)
  }

  public static exists (_path) : boolean {
    for (let p in Loom.paths) {
      let expectedPath = path.join(_path, Loom.paths[p])
      if(!utils.fs.exists(expectedPath)) { return false }
    }
    
    return true
  }

  public async stage (_paths: string[]): Promise < void > {
    return this.index!.stage(_paths)
  }

  public async snapshot (_message: string): Promise < void > {
    // let staged   = this.index.staged
    // let tree     = await this.node.upload(staged, { tree: true })
    // let snapshot = await this.workingFibre.snapshot()
    // let cid      = await this.node.put(snapshot.data)
    // 
    // this.head = cid
    // 
    // return cid
  }
  
  public async checkout (_fibreName: string) {
    
  }
  
  public async weave (_originFibreName: string, _destinationFibreName: string) {
    
  }

  public async revert (_snapshotCID: string) {
    
  } 
}