import npath from 'path'
import Branch from '../components/branch'
import Repository from '../components/repository'
import Tree from '../objects/tree'
import * as utils from '../utils'

export default class BranchFactory {
  public repository: Repository

  public constructor(repository: Repository) {
    this.repository = repository
  }

  public create(name: string, opts?: any): Branch {
    if (this.exists(name, opts)) {
      const fullName = opts && opts.remote ? opts.remote + ':' + name : name
      throw new Error('Branch ' + fullName + ' already exists')
    }

    return new Branch(this.repository, name, opts)
  }

  public load(name: string, opts?: any): Branch {
    if (!this.exists(name, opts)) {
      const fullName = opts && opts.remote ? opts.remote + ':' + name : name
      throw new Error('Branch ' + fullName + ' doesn not exist')
    }

    return new Branch(this.repository, name, opts)
  }

  public exists(name: string, opts?: any): boolean {
    const fullName = opts && opts.remote ? opts.remote + ':' + name : name
    return utils.fs.exists(npath.join(this.repository.paths.branches, fullName))
  }

  public head(name: string, opts?: any): string {
    const fullName = opts && opts.remote ? opts.remote + ':' + name : name
    return utils.yaml.read(npath.join(this.repository.paths.branches, fullName))
  }

  public async checkout(name: string): Promise<void> {
    await this.repository.index!.update()

    if (!this.exists(name)) {
      throw new Error('Branch ' + name + ' does not exist')
    }
    if (this.repository.currentBranchName === name) {
      throw new Error('Already on branch ' + name)
    }
    if (this.repository.index!.unsnapshot.length) {
      throw new Error(
        'You have unsnapshot modifications: ' +
          this.repository.index!.unsnapshot
      )
    }
    if (this.repository.index!.modified.length) {
      throw new Error(
        'You have unstaged and unsnaphot modifications: ' +
          this.repository.index!.modified
      )
    }

    const newHead = this.head(name)
    const baseHead = this.repository.head

    if (newHead !== 'undefined') {
      let baseTree
      let newTree

      newTree = await this.repository.node!.get(newHead, 'tree')

      if (baseHead !== 'undefined') {
        baseTree = await this.repository.node!.get(baseHead, 'tree')
      } else {
        baseTree = await new Tree({ path: '.', children: [] }).toIPLD()
      }

      await this.repository.updateWorkingDirectory(baseTree, newTree)
      await this.repository.index!.reinitialize(newTree)
    } else {
      await this.repository.index!.reinitialize(
        await new Tree({ path: '.', children: [] }).toIPLD()
      )
    }

    this.repository.currentBranchName = name
  }
}
