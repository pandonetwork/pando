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

export default class Repository {
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

  public static async remove(path: string = '.') {
    utils.fs.rm(npath.join(path, Repository.paths.pando))
  }

  public static exists(path: string = '.'): boolean {
    for (const p in Repository.paths) {
      if (Repository.paths.hasOwnProperty(p)) {
        const expected = npath.join(path, Repository.paths[p])
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
  public branches = new BranchFactory(this)
  public remotes = new RemoteFactory(this)
  public paths = { ...Repository.paths }

  public get currentBranchName(): string {
    return utils.yaml.read(this.paths.current)
  }

  public set currentBranchName(name: string) {
    utils.yaml.write(this.paths.current, name)
  }

  public get currentBranch(): Branch {
    return this.branches.load(this.currentBranchName)
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
    for (const p in this.paths) {
      if (this.paths.hasOwnProperty(p)) {
        this.paths[p] = npath.join(path, this.paths[p])
      }
    }
    this.pando = pando
  }

  public async stage(paths: string[]): Promise<any> {
    const index = await this.index!.stage(paths)
    return index
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

  public async push(remoteName: string, branch: string): Promise<any> {
    const head = this.head
    const remote = await this.remotes.load(remoteName)
    const tx = await remote.push(branch, head)

    return tx
  }

  public async fetch(remotes: string[]): Promise<any> {
    const heads = {}

    for (const remoteName of remotes) {
      const remote = await this.remotes.load(remoteName)
      heads[remoteName] = await remote.fetch()
    }

    return heads
  }

  public async fromIPLD(object) {
    let attributes = {}

    const data: any = {}

    let node

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

  public async updateWorkingDirectory(baseTree: any, newTree: any) {
    // Delete meta properties to loop over tree's entries only
    delete baseTree['@type']
    delete baseTree.path
    // Delete meta properties to loop over tree's entries only
    delete newTree['@type']
    delete newTree.path

    for (const entry in newTree) {
      if (!baseTree[entry]) {
        // entry existing in newTree but not in baseTree
        await this.node!.download(newTree[entry]['/'])
        delete baseTree[entry]
      } else {
        // entry existing both in newTree and in baseTree
        if (baseTree[entry]['/'] !== newTree[entry]['/']) {
          const baseEntryType = await this.node!.get(
            baseTree[entry]['/'],
            '@type'
          )
          const newEntryType = await this.node!.get(
            newTree[entry]['/'],
            '@type'
          )
          if (baseEntryType !== newEntryType) {
            // entry type differs in baseTree and newTree
            await this.node!.download(newTree[entry]['/'])
          } else if (baseEntryType === 'file') {
            // entry type is the same in baseTree and newTree
            // entry is a file
            await this.node!.download(newTree[entry]['/'])
          } else if (baseEntryType === 'tree') {
            // entry type is the same in baseTree and newTree
            // entry is a tree
            const baseEntry = await this.node!.get(baseTree[entry]['/'])
            const newEntry = await this.node!.get(newTree[entry]['/'])
            await this.updateWorkingDirectory(baseEntry, newEntry)
          }
        }
        delete baseTree[entry]
      }
    }

    for (const entry in baseTree) {
      if (baseTree.hasOwnProperty(entry)) {
        // Delete remaining files
        const path = await this.node!.get(baseTree[entry]['/'], 'path')
        utils.fs.rm(npath.join(this.paths.root, path))
      }
    }
  }

  private tree() {
    const index = this.index!.current
    const tree = new Tree({ path: '.' })
    let staged = this.index!.staged
    // for (const file of staged) {
    //   if (index[file].wdir === 'null') {
    //     delete index[file]
    // }

    staged.forEach((file, i) => {
      if (index[file].stage === 'todelete') {
        delete index[file]
        staged = staged.splice(i, 1)
      }
    })

    for (const file of staged) {
      file.split(npath.sep).reduce((parent, name): any => {
        const currentPath = npath.join(parent.path!, name)
        if (!parent.children[name]) {
          if (index[currentPath]) {
            parent.children[name] = new File({
              link: index[currentPath].stage,
              path: currentPath
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
}
