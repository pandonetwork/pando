import Repository from '@components/repository'
import Snapshot from '@objects/snapshot'
import * as utils from '@utils'
import register from 'module-alias/register'
import path from 'path'

export default class Branch {
  public repository: Repository
  public name: string
  public remote?: string

  public get fullName(): string {
    if (this.remote) {
      return this.remote + ':' + this.name
    } else {
      return this.name
    }
  }

  public get path(): string {
    return path.join(this.repository.paths.branches, this.fullName)
  }

  public get head(): string {
    return utils.yaml.read(this.path)
  }

  public set head(cid: string) {
    utils.yaml.write(this.path, cid)
  }

  public constructor(repository: Repository, name: string, opts?: any) {
    this.repository = repository
    this.name = name
    this.remote = opts && opts.remote ? opts.remote : undefined
    this.head = utils.fs.exists(this.path) ? this.head : 'undefined'
  }

  public async log(): Promise<any[]> {
    if (this.head === 'undefined') {
      throw new Error("Branch '" + this.fullName + "' is empty")
    }
    const log: any[] = []
    let snapshot: any = await this.repository.fromCID(this.head)

    do {
      log.push(snapshot)
      snapshot = snapshot.parents[0] ? snapshot.parents[0] : undefined
    } while (snapshot)

    return log
  }
}
