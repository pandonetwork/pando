import fs from 'fs-extra'
import npath from 'path'
import IPFS  from 'ipfs'
import Pando from '..'
import OrganizationFactory from './organization/factory'
import FiberFactory from './fiber/factory'


interface PlantPaths {
  root: string
  pando: string
  ipfs:string
  organizations: string
  fibers: string
}

export default class Plant {
  public pando:  Pando
  public paths:  PlantPaths
  public node:   IPFS
  public organizations: OrganizationFactory
  public fibers: FiberFactory

  public constructor(pando: Pando, path: string = '.', node: IPFS) {
    this.pando  = pando
    this.paths  = {
      root:   path,
      pando:  npath.join(path, '.pando'),
      ipfs:   npath.join(path, '.pando', 'ipfs'),
      organizations: npath.join(path, '.pando', 'organizations'),
      fibers: npath.join(path, '.pando', 'fibers')
    }
    this.node   = node
    this.organizations = new OrganizationFactory(this)
    this.fibers = new FiberFactory(this)
  }

  public async remove() {
    if (this.fibers.db.isOpen()) { await this.fibers.db.close() }
    if (this.organizations.db.isOpen()) { await this.organizations.db.close() }

    fs.removeSync(this.paths.pando)
  }
}
