import register from 'module-alias/register'

import Repository from '@components/repository'
import * as utils from '@utils'
import CID from 'cids'
import klaw from 'klaw-sync'
import path from 'path'
import fs from 'fs'

export default class Index {
  public static async new(repository: Repository): Promise<Index> {
    return new Index(repository)
  }

  public static async load(repository: Repository): Promise<Index> {
    return new Index(repository)
  }

  public repository: Repository

  public get path() {
    return this.repository.paths.index
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

  public get untracked(): string[] {
    const current = this.current
    const untracked: any[] = []

    for (const entry in current) {
      if (current[entry].stage === 'null') {
        untracked.push(entry)
      }
    }

    return untracked
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

  constructor(repository: Repository) {
    this.repository = repository
  }

  public async reinitialize(tree: any, index?: any): Promise<any> {
    index = index || {}

    delete tree['@type']
    delete tree.path

    for (const entry in tree) {
      if (tree.hasOwnProperty(entry)) {
        const node = await this.repository.node!.get(tree[entry]['/'])
        if (node['@type'] === 'tree') {
          await this.reinitialize(node, index)
        } else if (node['@type'] === 'file') {
          const cid = new CID(node.link['/']).toBaseEncodedString()
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

    return index
  }

  public async update(): Promise<any> {
    const index = this.current
    const files = {}
    const filter = item => {
      return (
        item.path.indexOf('.pando') < 0 && item.path.indexOf('node_modules') < 0
      )
    }
    const listing = klaw(this.repository.paths.root, { nodir: true, filter })

    for (const item of listing) {
      const relativePath = path.relative(this.repository.paths.root, item.path)
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
            const cid = await this.repository.node!.cid(
              path.join(this.repository.paths.root, relativePath),
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
        const cid = await this.repository.node!.cid(
          path.join(this.repository.paths.root, relativePath),
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
      if (fs.lstatSync(filePath).isDirectory()) {
        const filter = item => {
          return (
            item.path.indexOf('.pando') < 0 &&
            item.path.indexOf('node_modules') < 0
          )
        }
        const listing = klaw(filePath, { nodir: true, filter })

        for (const item of listing) {
          const relativePath = path.relative(
            this.repository.paths.root,
            item.path
          )
          filePaths.push(relativePath)
        }
      } else if (fs.lstatSync(filePath).isFile()) {
        const relativePath = path.relative(this.repository.paths.root, filePath)

        if (utils.fs.exists(filePath)) {
          const cid = await this.repository.node!.upload(filePath)
          index[relativePath].stage = cid
        } else if (index[relativePath]) {
          index[relativePath].wdir = 'null'
          index[relativePath].stage = 'todelete'
        } else {
          throw new Error(
            filePath +
              ' does not exist neither in current working directory nor in index'
          )
        }
      }
    }

    this.current = index
    return index
  }
}
