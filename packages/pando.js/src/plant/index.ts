import fs from 'fs-extra'
import npath from 'path'
import IPFS  from 'ipfs'
import Pando from '..'
import OrganizationFactory from './organization/factory'
import FiberFactory from './fiber/factory'
import Fiber from './fiber'

import IPFSClient from 'ipfs-http-client'

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

  public async publish (organizationName: string, organismName: string, message: string = 'n/a'): Promise<any> {
    const fiber = await this.fibers.current() as Fiber
    const snapshot = await fiber.snapshot('Automatic snapshot before RFI')

    const metadata = {
      tree: snapshot.tree,
      message: message
    }
    const lineage = {
      destination: this.pando.options.ethereum.account,
      minimum: 0,
      metadata: ''
    }

    const cid = (await this.node.dag.put(metadata, { format: 'dag-cbor', hashAlg: 'sha3-512' })).toBaseEncodedString()

    const individuation = {
      metadata: cid
    }

    const organization = await this.organizations.load({ name: organizationName })
    const address = await organization.organisms.address(organismName)

    await this.node.start()
    const peer = await this.node.id()
    const gateway = IPFSClient({ host: 'localhost', port: '5001', protocol: 'http' })
    await gateway.swarm.connect('/ip4/127.0.0.1/tcp/4003/ws/ipfs/' + peer.id)
    await gateway.pin.add(cid)
    await gateway.pin.add(snapshot.tree)
    await this.node.stop()

    const receipt = await organization.scheme.createRFI(address, individuation, [lineage])

    return receipt
  }

  public async remove() {
    if (this.fibers.db.isOpen()) { await this.fibers.db.close() }
    if (this.organizations.db.isOpen()) { await this.organizations.db.close() }

    fs.removeSync(this.paths.pando)
  }
}
