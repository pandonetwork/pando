import Loom from '@components/loom'
import * as utils from '@utils'
import klaw from 'klaw-sync'
import path from 'path'

export default class Index {
  public static async new(loom: Loom): Promise<Index> {
    return new Index(loom)
  }

  public static async load(loom: Loom): Promise<Index> {
    return new Index(loom)
  }

  public loom: Loom

  public get path() {
    return this.loom.paths.index
  }

  public get current(): any {
    return utils.yaml.read(this.path)
  }

  public set current(index: any) {
    utils.yaml.write(this.path, index)
  }

  /**
   * Returns staged but unsnaphot files
   *
   * @returns {string[]}
   */
  public get unsnapshot(): string[] {
    const current = this.current
    const unsnaphot: any[] = []

    for (const entry in current) {
      if (current[entry].repo !== current[entry].stage) {
        unsnaphot.push(entry)
      }
    }

    return unsnaphot
  }

  /**
   * Returns once staged files
   *
   * @returns {string[]}
   */
  public get staged(): string[] {
    const current = this.current
    const staged: any[] = []

    for (const entry in current) {
      if (current[entry].stage !== 'null') {
        staged.push(entry)
      }
    }

    return staged
  }

  /**
   * Returns modified once staged files
   *
   * @returns {string[]}
   */
  public get modified(): string[] {
    const current = this.current
    const modified: any[] = []

    for (const entry in current) {
      if (
        current[entry].stage !== 'null' &&
        current[entry].wdir !== current[entry].stage
      ) {
        modified.push(entry)
      }
    }

    return modified
  }

  constructor(loom: Loom) {
    this.loom = loom
  }

  public async reinitialize(tree: any, index?: any): Promise<any> {
    index = index || {}

    delete tree['@type']
    delete tree.path

    for (const entry in tree) {
      if (tree.hasOwnProperty(entry)) {
        const node = await this.loom.node!.get(tree[entry]['/'])
        if (node['@type'] === 'tree') {
          await this.reinitialize(node, index)
        } else if (node['@type'] === 'file') {
          const cid = node.link['/']
          index[node.path] = {
            mtime: new Date(Date.now()),
            repo: cid,
            stage: cid,
            wdir: cid
          }
        }
      }
    }

    this.current = index
  }

  public async update(): Promise<any> {
    const index = this.current
    const files = {}
    const filter = item => item.path.indexOf('.pando') < 0
    const listing = klaw(this.loom.paths.root, { nodir: true, filter })

    for (const item of listing) {
      const relativePath = path.relative(this.loom.paths.root, item.path)
      files[relativePath] = { mtime: new Date(item.stats.mtime) }
    }

    const newFiles: any = Object.assign(files)

    for (const relativePath in index) {
      if (index.hasOwnProperty(relativePath)) {
        if (files[relativePath]) {
          // files at _path still exists
          if (
            new Date(index[relativePath].mtime) <=
            new Date(files[relativePath].mtime)
          ) {
            // files at _path has been modified
            const cid = await this.loom.node!.cid(
              path.join(this.loom.paths.root, relativePath),
              { file: true }
            )
            index[relativePath].mtime = files[relativePath].mtime
            index[relativePath].wdir = cid
          }
        } else {
          // files at _path has been deleted
          index[relativePath].mtime = new Date(Date.now())
          index[relativePath].wdir = 'null'
        }
        delete newFiles[relativePath]
      }
    }

    for (const relativePath in newFiles) {
      if (newFiles.hasOwnProperty(relativePath)) {
        // file at _path has been added
        const cid = await this.loom.node!.cid(
          path.join(this.loom.paths.root, relativePath),
          { file: true }
        )
        index[relativePath] = {
          mtime: files[relativePath].mtime,
          repo: 'null',
          stage: 'null',
          wdir: cid
        }
      }
    }

    // for (let _path in index) { // remove deleted files from index
    //   if (index[_path].wdir === 'null') {
    //
    //   }
    // }

    this.current = index

    return index
  }

  public async stage(filePaths: string[]): Promise<any> {
    const index = await this.update()

    for (let filePath of filePaths) {
      filePath = path.normalize(filePath)
      const relativePath = path.relative(this.loom.paths.root, filePath)

      if (utils.fs.exists(filePath)) {
        const cid = await this.loom.node!.upload(filePath)
        index[relativePath].stage = cid
      } else if (index[relativePath].wdir === 'null') {
        delete index[relativePath]
      } else {
        throw new Error(
          filePath + ' does not exist in current working directory'
        )
      }
    }

    this.current = index

    return index
  }
}
