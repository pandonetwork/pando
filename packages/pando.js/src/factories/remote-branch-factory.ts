import Branch from '@components/branch'
import Remote from '@components/remote'
import Tree from '@objects/tree'
import * as utils from '@utils'
import npath from 'path'

export default class RemoteBranchFactory {
  public remote: Remote

  public constructor(remote: Remote) {
    this.remote = remote
  }

  public async create(name: string): Promise<void> {
    await this.remote.tree.newBranch(name)
    await this.remote.repository.branches.create(name, {
      remote: this.remote.name
    })
  }

  public async list(): Promise<string[]> {
    const separator = await this.remote.tree.SEPARATOR()
    const branches = await this.remote.tree.getBranchesName()
    const array = branches.split(separator)
    array.splice(-1, 1)

    return array
  }
}
