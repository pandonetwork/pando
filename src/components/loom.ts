import Branch from '@components/branch'
import Index from '@components/index'
import Node from '@components/node'
import BranchFactory from '@factories/branch-factory'
import RemoteFactory from '@factories/remote-factory'
import File from '@objects/file'
import Snapshot from '@objects/snapshot'
import Tree from '@objects/tree'
import Pando from '@pando'
import * as utils from '@utils'
import CID from 'cids'
import npath from 'path'

export default class Loom {
  /* tslint:disable:object-literal-sort-keys */
  public static paths = {
    root: '.',
    pando: '.pando',
    ipfs: '.pando/ipfs',
    index: '.pando/index',
    current: '.pando/current',
    config: '.pando/config',
    branches: '.pando/branches',
    remotes: '.pando/remotes'
  }
  /* tslint:enable:object-literal-sort-keys */

  public static async new(
    pando: Pando,
    path: string = '.',
    opts?: any
  ): Promise<Loom> {
    const loom = new Loom(pando, path)

    // Initialize .pando directory
    await utils.fs.mkdir(loom.paths.pando)
    await utils.fs.mkdir(loom.paths.ipfs)
    await utils.fs.mkdir(loom.paths.branches)
    await utils.fs.mkdir(loom.paths.remotes)
    await utils.yaml.write(loom.paths.index, {})
    await utils.yaml.write(loom.paths.config, pando.config)
    // Initialize master branch
    await Branch.new(loom, 'master')
    await utils.yaml.write(loom.paths.current, 'master')
    // Initialize node and index
    loom.node = await Node.new(loom)
    loom.index = await Index.new(loom)

    return loom
  }

  public static async load(path: string = '.', opts?: any): Promise<Loom> {
    if (!Loom.exists(path)) {
      throw new Error('No pando loom found at ' + path)
    }

    const pando = new Pando(
      utils.yaml.read(npath.join(path, Loom.paths.config))
    )
    const loom = new Loom(pando, path)
    loom.node = await Node.load(loom)
    loom.index = await Index.load(loom)

    return loom
  }

  public static async remove(path: string = '.') {
    utils.fs.rm(path)
  }

  public static exists(path: string = '.'): boolean {
    for (const p in Loom.paths) {
      if (Loom.paths.hasOwnProperty(p)) {
        const expected = npath.join(path, Loom.paths[p])
        if (!utils.fs.exists(expected)) {
          return false
        }
      }
    }
    return true
  }

  public pando: Pando
  public node?: Node
  public index?: Index
  public branch = new BranchFactory(this)
  public remote = new RemoteFactory(this)
  public paths = { ...Loom.paths }

  public get currentBranchName(): string {
    return utils.yaml.read(this.paths.current)
  }

  public set currentBranchName(name: string) {
    utils.yaml.write(this.paths.current, name)
  }

  public get currentBranch(): Branch {
    return Branch.load(this, this.currentBranchName)
  }

  public get head() {
    return this.currentBranch.head
  }

  public get config(): any {
    return utils.yaml.read(this.paths.config)
  }

  public set config(config: any) {
    utils.yaml.write(this.paths.config, config)
  }

  public constructor(pando: Pando, path: string = '.', opts?: any) {
    for (const repositoryPath in this.paths) {
      if (this.paths.hasOwnProperty(repositoryPath)) {
        this.paths[repositoryPath] = npath.join(
          path,
          this.paths[repositoryPath]
        )
      }
    }
    this.pando = pando
  }

  public async stage(paths: string[]): Promise<void> {
    return this.index!.stage(paths)
  }

  public async snapshot(message: string): Promise<Snapshot> {
    const index = await this.index!.update()

    if (!this.index!.unsnapshot.length) {
      throw new Error('Nothing to snapshot')
    }

    const tree = await this.tree()
    const treeCID = await tree.put(this.node!)
    const parents =
      this.head !== 'undefined'
        ? [await this.fromIPLD(await this.node!.get(this.head))]
        : undefined
    const snapshot = new Snapshot({
      author: this.pando.config.author,
      message,
      parents,
      tree
    })
    const cid = await this.node!.put(await snapshot.toIPLD())
    this.currentBranch.head = cid.toBaseEncodedString()

    return snapshot
  }

  public async checkout(_branchName: string) {
    await this.index!.update()

    if (!Branch.exists(this, _branchName)) {
      throw new Error('Branch ' + _branchName + ' does not exist')
    }
    if (this.index!.unsnapshot.length) {
      throw new Error(
        'You have unsnapshot modifications: ' + this.index!.unsnapshot
      )
    }
    if (this.index!.modified.length) {
      throw new Error(
        'You have unstaged and unsnaphot modifications: ' + this.index!.modified
      )
    }

    const newHead = Branch.head(this, _branchName)
    const baseHead = this.head

    if (newHead !== 'undefined') {
      let baseTree, newTree

      newTree = await this.node!.get(newHead, 'tree')

      if (baseHead !== 'undefined') {
        baseTree = await this.node!.get(baseHead, 'tree')
      } else {
        baseTree = new Tree({ path: '.', children: [] }).toIPLD()
      }

      await this.updateWorkingDirectory(baseTree, newTree)
      await this.index!.reinitialize(newTree)
    } else {
      await this.index!.reinitialize(
        await new Tree({ path: '.', children: [] }).toIPLD()
      )
    }

    this.currentBranchName = _branchName
  }

  public async push(_remote: string, _branch: string): Promise<any> {
    const head = this.head
    const remote = await this.remote.load(_remote)
    const tx = await remote.push(_branch, head)

    return tx
  }

  public async fromIPLD(object) {
    let attributes = {},
      data: any = {},
      node

    switch (object['@type']) {
      case 'snapshot':
        attributes = Reflect.getMetadata('ipld', Snapshot.prototype.constructor)
        break
      case 'tree':
        attributes = Reflect.getMetadata('ipld', Tree.prototype.constructor)
        break
      case 'file':
        attributes = Reflect.getMetadata('ipld', File.prototype.constructor)
        break
      default:
        throw new TypeError('Unrecognized IPLD node.')
    }

    for (const attribute in attributes) {
      if (attributes[attribute].link) {
        const type = attributes[attribute].type

        switch (type) {
          case 'map':
            data.children = {}
            for (const child in object) {
              if (child !== '@type' && child !== 'path') {
                data.children[child] = await this.fromIPLD(
                  await this.node!.get(object[child]['/'])
                )
              }
            }
            break
          case 'array':
            data[attribute] = []
            for (const child of object[attribute]) {
              data[attribute].push(
                await this.fromIPLD(await this.node!.get(child['/']))
              )
            }
            break
          case 'direct':
            data[attribute] = object[attribute]['/']
            break
          default:
            data[attribute] = await this.fromIPLD(
              await this.node!.get(object[attribute]['/'])
            )
        }
      } else {
        data[attribute] = object[attribute]
      }
    }

    switch (object['@type']) {
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

  private tree() {
    const index = this.index!.current
    const staged = this.index!.staged
    const tree = new Tree({ path: '.' })

    for (const file of staged) {
      file.split(npath.sep).reduce((parent, name): any => {
        const currentPath = npath.join(parent.path!, name)
        if (!parent.children[name]) {
          if (index[currentPath]) {
            parent.children[name] = new File({
              path: currentPath,
              link: index[currentPath].stage
            })
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

  private async updateWorkingDirectory(_baseTree: any, _newTree: any) {
    // Delete meta properties to loop over tree's entries only
    delete _baseTree['@type']
    delete _baseTree.path
    // Delete meta properties to loop over tree's entries only
    delete _newTree['@type']
    delete _newTree.path

    for (const entry in _newTree) {
      if (!_baseTree[entry]) {
        // entry existing in newTree but not in baseTree
        await this.node!.download(_newTree[entry]['/'])
        delete _baseTree[entry]
      } else {
        // entry existing both in newTree and in baseTree
        if (_baseTree[entry]['/'] !== _newTree[entry]['/']) {
          const baseEntryType = await this.node!.get(
            _baseTree[entry]['/'],
            '@type'
          )
          const newEntryType = await this.node!.get(
            _newTree[entry]['/'],
            '@type'
          )
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
            const baseEntry = await this.node!.get(_baseTree[entry]['/'])
            const newEntry = await this.node!.get(_newTree[entry]['/'])
            await this.updateWorkingDirectory(baseEntry, newEntry)
          }
        }
        delete _baseTree[entry]
      }
    }

    for (const entry in _baseTree) {
      // Delete remaining files
      const _path = await this.node!.get(_baseTree[entry]['/'], 'path')
      utils.fs.rm(npath.join(this.paths.root, _path))
    }
  }
}
