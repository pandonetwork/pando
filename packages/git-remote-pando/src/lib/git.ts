import debug from 'debug'
import fs from 'fs-extra'
import npath from 'path'
import shell from 'shelljs'
import gitP from 'simple-git/promise'
import { SmartBuffer } from 'smart-buffer'
import zlib from 'zlib'
import Helper from '../helper'

const git = gitP()

export default class GitHelper {
  public helper: Helper
  public debug: any

  // OK
  constructor(helper: Helper) {
    this.helper = helper
    this.debug = debug('pando')
  }

  /***** core methods *****/

  // OK
  public async collect(oid: string, mapping: any): Promise<any> {
    this.debug('collecting', oid)

    const cid = this.helper.ipld.shaToCid(oid)
    if (mapping[cid]) return mapping

    const node: any = await this.load(oid)

    if (node.gitType === 'commit') {
      // node is a commit
      const _mapping = await this.collect(this.helper.ipld.cidToSha(node.tree['/']), mapping)
      return { ...mapping, ..._mapping, ...{ [cid]: node } }
    } else if (Buffer.isBuffer(node)) {
      // node is a blob
      return { ...mapping, ...{ [cid]: node } }
    } else {
      // node is a tree
      for (const entry in node) {
        const _mapping = await this.collect(this.helper.ipld.cidToSha(node[entry].hash['/']), mapping)
        mapping = { ...mapping, ..._mapping }
      }

      return { ...mapping, ...{ [cid]: node } }
    }
  }

  // OK
  public async download(oid: any): Promise<void> {
    this.debug('downloading', oid)

    if (await this.exists(oid)) return

    const cid = this.helper.ipld.shaToCid(oid)
    const node = await this.helper.ipld.get(cid)

    if (node.gitType === 'commit') {
      // node is a commit
      await this.download(this.helper.ipld.cidToSha(node.tree['/']))

      for (const parent of node.parents) {
        await this.download(this.helper.ipld.cidToSha(parent['/']))
      }

      await this.dump(oid, node)
    } else if (Buffer.isBuffer(node)) {
      // node is a blob
      await this.dump(oid, node)
    } else {
      // node is a tree
      for (const entry in node) {
        await this.download(await this.helper.ipld.cidToSha(node[entry].hash['/']))
      }

      await this.dump(oid, node)
    }
  }

  /***** fs-related methods *****/

  // OK
  public async exists(oid: string): Promise<boolean> {
    // modify this function to rely on git cat-file -e $sha^{commit}
    // see https://stackoverflow.com/questions/18515488/how-to-check-if-the-commit-exists-in-a-git-repository-by-its-sha-1
    return fs.pathExists(await this.path(oid))
  }

  // OK
  public async load(oid: string): Promise<any> {
    const type = shell.exec(`git cat-file -t ${oid}`, { silent: true }).stdout.trim()
    const size = shell.exec(`git cat-file -s ${oid}`, { silent: true }).stdout.trim()
    const data = await git.binaryCatFile([type, oid])

    const raw = new SmartBuffer()
    raw.writeString(`${type} `)
    raw.writeString(size)
    raw.writeUInt8(0)
    raw.writeBuffer(data)

    return this.helper.ipld.deserialize(raw.toBuffer())
  }

  // OK
  public async dump(oid: string, node: any): Promise<void> {
    const path = await this.path(oid)
    const buffer = await this.helper.ipld.serialize(node)
    await fs.ensureFile(path)
    fs.writeFileSync(path, zlib.deflateSync(buffer))
  }

  /***** utility methods *****/

  // OK
  public async path(oid: string): Promise<string> {
    const subdirectory = oid.substring(0, 2)
    const filename = oid.substring(2)

    return npath.join(this.helper.path, 'objects', subdirectory, filename)
  }
}
