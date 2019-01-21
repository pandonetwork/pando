import fs from 'fs-extra'
import IPFS from 'ipfs'
import IPFSClient from 'ipfs-http-client'
import klaw from 'klaw'
import npath from 'path'
import stream from 'stream'
import through2 from 'through2'
import Pando from '..'
import Fiber from './fiber'
import FiberFactory from './fiber/factory'
import OrganizationFactory from './organization/factory'

interface PlantPaths {
  root: string
  pando: string
  ipfs: string
  organizations: string
  fibers: string
}

export default class Plant {
  public pando: Pando
  public paths: PlantPaths
  public node: IPFS
  public organizations: OrganizationFactory
  public fibers: FiberFactory

  public constructor(pando: Pando, path: string = '.', node: IPFS) {
    this.pando = pando
    this.paths = {
      fibers: npath.join(path, '.pando', 'fibers'),
      ipfs: npath.join(path, '.pando', 'ipfs'),
      organizations: npath.join(path, '.pando', 'organizations'),
      pando: npath.join(path, '.pando'),
      root: path,
    }
    this.node = node
    this.organizations = new OrganizationFactory(this)
    this.fibers = new FiberFactory(this)
  }

  public async extract(_organization: string, _organism: string): Promise<void> {
    const ipfs = new IPFSClient({ host: 'localhost', port: '5001', protocol: 'http' })
    const organization = await this.organizations.load({ name: _organization })
    const organism = await organization.organisms.load({ name: _organism })

    const head = await organism.head()

    if (head.blockstamp !== 0) {
      const fiber = (await this.fibers.current()) as Fiber
      await fiber.snapshot(`Automatic snapshot before extraction of ${_organization}:${_organism}`)
      await this._clear()

      const metadata = await ipfs.dag.get(head.metadata)
      await this._download(metadata.value.tree)
    }
  }

  public async publish(organizationName: string, organismName: string, message: string = 'n/a'): Promise<any> {
    const fiber = (await this.fibers.current()) as Fiber
    const snapshot = await fiber.snapshot('Automatic snapshot before RFI')

    const metadata = {
      message,
      tree: snapshot.tree,
    }
    const lineage = {
      destination: this.pando.options.ethereum.account,
      metadata: '',
      minimum: 0,
    }

    const cid = (await this.node.dag.put(metadata, { format: 'dag-cbor', hashAlg: 'sha3-512' })).toBaseEncodedString()

    const individuation = {
      metadata: cid,
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
    if (this.fibers.db.isOpen()) {
      await this.fibers.db.close()
    }
    if (this.organizations.db.isOpen()) {
      await this.organizations.db.close()
    }

    fs.removeSync(this.paths.pando)
  }

  private async _download(cid: string, relativePath = ''): Promise<void> {
    const ipfs = new IPFSClient({ host: 'localhost', port: '5001', protocol: 'http' })
    const entries = await ipfs.ls(cid)

    for (const entry of entries) {
      if (entry.type === 'dir') {
        await this._download(entry.hash, npath.join(relativePath, entry.name))
        await fs.ensureDir(npath.join(this.paths.root, this.paths.root, relativePath, entry.name))
      } else {
        const buffer = await ipfs.cat(entry.hash)
        await fs.ensureFile(npath.join(this.paths.root, relativePath, entry.name))
        await fs.writeFile(npath.join(this.paths.root, relativePath, entry.name), buffer)
      }
    }
  }

  private async _clear(): Promise<any> {
    const files: string[] = []
    const ops: any[] = []

    return new Promise<any>((resolve, reject) => {
      const write = new stream.Writable({
        objectMode: true,
        write: async (file, encoding, next) => {
          files.push(file.path)
          next()
        },
      })

      write
        .on('error', err => {
          reject(err)
        })
        .on('finish', async () => {
          for (const file of files) {
            ops.push(fs.remove(file))
          }

          await Promise.all(ops)
          resolve()
        })

      this._ls(this.paths.root, { dir: true }).pipe(write)
    })
  }

  private _ls(path: string, { all = false, dir = false }: { all?: boolean; dir?: boolean } = {}): any {
    const root = npath.resolve(this.paths.root)

    return klaw(path).pipe(
      through2.obj(function(item, enc, next) {
        if (item.path === root) {
          // ignore .
          next()
        } else if (!all && item.path.indexOf('.pando') >= 0) {
          // ignore .pando directory
          next()
        } else if (!dir && item.stats.isDirectory()) {
          // ignore empty directories
          next()
        } else {
          this.push(item)
          next()
        }
      })
    )
  }
}
