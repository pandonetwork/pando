/* eslint-disable import/no-duplicates */
import Pando from '../../lib'
import Repository from '../../lib/components/repository'
/* eslint-enable import/no-duplicates */
import { opts } from '../data'
import * as utils from '../utils'
import chai from 'chai'
import npath from 'path'
import 'chai/register-should'

chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))

const expect = chai.expect

describe('Repository#RemoteFactory', () => {
  let pando, repository, remote

  before(async () => {
    pando = await Pando.create(opts)
    repository = await pando.repositories.create(npath.join('test', 'mocks'))
  })

  after(async () => {
    await Repository.remove(npath.join('test', 'mocks'))
  })

  describe('#deploy', () => {
    it('should deploy remote correctly', async () => {
      remote = await repository.remotes.deploy('origin')
      let branches = await remote.branches.list()

      expect(remote.kernel).to.exist()
      expect(remote.acl).to.exist()
      expect(remote.tree).to.exist()
      remote.repository.should.deep.equal(repository)
      remote.name.should.equal('origin')
      branches[0].should.equal('master')
    })

    it('should save remote address correctly', async () => {
      let address = utils.yaml.read(
        npath.join(repository.paths.remotes, 'origin')
      )

      address.should.equal(remote.kernel.address)
    })

    it('should reject if remote already exists', async () => {
      expect(repository.remotes.deploy('origin')).to.be.rejected()
    })
  })

  describe('#at', () => {
    it('should return remote informations correctly', async () => {
      let { kernel, acl, tree } = await repository.remotes.at(
        remote.kernel.address
      )

      kernel.address.should.equal(remote.kernel.address)
      acl.address.should.equal(remote.acl.address)
      tree.address.should.equal(remote.tree.address)
    })
  })

  // describe('#load', async () => {
  //   it('should load remote correctly', async () => {
  //     let loaded = await repository.remotes.load('origin')
  //
  //     loaded.kernel.address.should.equal(remote.kernel.address)
  //     loaded.acl.address.should.equal(remote.acl.address)
  //     loaded.tree.address.should.equal(remote.tree.address)
  //     loaded.repository.should.deep.equal(repository)
  //     loaded.name.should.equal('origin')
  //   })
  //
  //   it('should load remote address correctly', async () => {
  //     let address = repository.remotes.loadAddress('origin')
  //
  //     address.should.equal(remote.kernel.address)
  //   })
  //
  //   it('should reject if remote does not exist', async () => {
  //     expect(repository.remotes.load('doesnotexist')).to.be.rejected()
  //   })
  // })
  //
  // describe('#add', async () => {
  //   let deployed
  //
  //   before(async () => {
  //     deployed = await repository.remotes.deploy('deployed')
  //   })
  //
  //   it('should add remote correctly', async () => {
  //     let added = await repository.remotes.add('added', deployed.kernel.address)
  //
  //     added.kernel.address.should.equal(deployed.kernel.address)
  //     added.acl.address.should.equal(deployed.acl.address)
  //     added.tree.address.should.equal(deployed.tree.address)
  //   })
  //
  //   it('should save remote address correctly', async () => {
  //     let address = repository.remotes.loadAddress('added')
  //
  //     address.should.equal(deployed.kernel.address)
  //   })
  //
  //   it('should reject if remote already exists', async () => {
  //     expect(repository.remotes.add('origin')).to.be.rejected()
  //   })
  // })
})
