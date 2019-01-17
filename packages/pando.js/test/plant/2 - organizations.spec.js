import chai from 'chai'
import fs from 'fs-extra'
import path from 'path'
import capture from 'collect-console'
import promised from 'chai-as-promised'
import Web3 from 'web3'
import Pando from '../../lib'

import { fixtures } from '@pando/helpers/fixtures'
import { options } from '@pando/helpers/options'

chai.use(promised)
const should = chai.should()

describe('plant/organizations', () => {
  let pando, plant

  const initialize = async () => {
    pando = await Pando.create(options)
    plant = await pando.plants.create(path.join('test', 'fixtures'))
  }

  const clean = async () => {
    await pando.close()

    const reset = capture.log()

    await plant.node.start()
    await plant.node.stop()

    reset()

    await plant.remove()
    await fixtures.restore()
  }

  describe('#exists', () => {
    let origin

    before(async () => {
      await initialize()
      origin = await plant.organizations.deploy('origin')
    })

    after(async () => {
      await clean()
    })

    describe('with name', () => {
      it('it should return true if organization exists in database', async () => {
        const exists = await plant.organizations.exists({ name: 'origin' })

        exists.should.equal(true)
      })

      it('it should return false if organization does not exist in database', async () => {
        const exists = await plant.organizations.exists({ name: 'doesnotexist' })

        exists.should.equal(false)
      })
    })

    describe('with address', () => {
      it('it should return true if organization exists in database', async () => {
        const exists = await plant.organizations.exists({ address: origin.address })

        exists.should.equal(true)
      })

      it('it should return false if organization does not exist in database', async () => {
        const exists = await plant.organizations.exists({ address: 'doesnotexist' })

        exists.should.equal(false)
      })
    })
  })

  describe('#deploy', () => {
    let organization

    before(async () => {
      await initialize()
    })

    after(async () => {
      await clean()
    })

    it('it should deploy and return organization', async () => {
      organization = await plant.organizations.deploy('origin')

      organization.should.exist
    })

    it('it should initialize organization', async () => {
      organization.kernel.address.should.exist
      organization.acl.address.should.exist
      organization.colony.address.should.exist
      organization.scheme.address.should.exist
    })

    it('it should save organization into database', async () => {
      let loaded = await plant.organizations.load({ name: 'origin' })

      loaded.address.should.equal(organization.address)
      loaded.kernel.address.should.equal(organization.kernel.address)
      loaded.acl.address.should.equal(organization.acl.address)
      loaded.colony.address.should.equal(organization.colony.address)
      loaded.scheme.address.should.equal(organization.scheme.address)
    })

    it("it should reject with error E_ORGANIZATION_NAME_ALREADY_EXISTS if organization's name already exists", async () => {
      return plant.organizations.deploy('origin').should.be.rejectedWith('E_ORGANIZATION_NAME_ALREADY_EXISTS')
    })
  })

  describe('#add', () => {
    let organization_1, organization_2, organization

    before(async () => {
      await initialize()
      organization_1 = await plant.organizations.deploy('organization_1')
      organization_2 = await plant.organizations.deploy('organization_2')
      // Nasty trick to clean database while organizations still being deployed
      await plant.organizations.delete({ name: 'organization_1' })
      await plant.organizations.delete({ name: 'organization_2' })
    })

    after(async () => {
      await clean()
    })

    it('it should return organization', async () => {
      organization = await plant.organizations.add('origin', organization_1.address)

      organization.should.exist
    })

    it('it should initialize organization', async () => {
      organization.kernel.address.should.exist
      organization.acl.address.should.exist
      organization.colony.address.should.exist
      organization.scheme.address.should.exist
    })

    it('it should save organization into database', async () => {
      let loaded = await plant.organizations.load({ name: 'origin' })

      loaded.address.should.equal(organization.address)
      loaded.kernel.address.should.equal(organization.kernel.address)
      loaded.acl.address.should.equal(organization.acl.address)
      loaded.colony.address.should.equal(organization.colony.address)
      loaded.scheme.address.should.equal(organization.scheme.address)
    })

    it("it should reject with error E_ORGANIZATION_NAME_ALREADY_EXISTS if organization's name already exists", async () => {
      return plant.organizations.add('origin', organization_2.address).should.be.rejectedWith('E_ORGANIZATION_NAME_ALREADY_EXISTS')
    })

    it("it should reject with error E_ORGANIZATION_ALREADY_EXISTS if organization's address already exists", async () => {
      return plant.organizations.add('notorigin', organization.address).should.be.rejectedWith('E_ORGANIZATION_ALREADY_EXISTS')
    })
  })

  describe('#load', () => {
    let origin, organization

    before(async () => {
      await initialize()
      origin = await plant.organizations.deploy('origin')
    })

    after(async () => {
      await clean()
    })

    describe('with name', () => {
      it('it should return organization', async () => {
        organization = await plant.organizations.load({ name: 'origin' })

        organization.should.exist
      })

      it('it should initialize organization', async () => {
        organization.kernel.address.should.exist
        organization.acl.address.should.exist
        organization.colony.address.should.exist
        organization.scheme.address.should.exist
      })

      it('it should reject with error E_ORGANIZATION_NOT_FOUND if organization does not exist', async () => {
        return plant.organizations.load({ name: 'doesnotexist' }).should.be.rejectedWith('E_ORGANIZATION_NOT_FOUND')
      })
    })

    describe('with address', () => {
      it('it should return organization', async () => {
        organization = await plant.organizations.load({ address: origin.address })

        organization.should.exist
      })

      it('it should initialize organization', async () => {
        organization.kernel.address.should.exist
        organization.acl.address.should.exist
        organization.colony.address.should.exist
        organization.scheme.address.should.exist
      })

      it('it should reject with error E_ORGANIZATION_NOT_FOUND if organization does not exist', async () => {
        return plant.organizations.load({ address: 'doesnotexist' }).should.be.rejectedWith('E_ORGANIZATION_NOT_FOUND')
      })
    })
  })

  describe('#address', () => {
    let origin

    before(async () => {
      await initialize()
      origin = await plant.organizations.deploy('origin')
    })

    after(async () => {
      await clean()
    })

    it("it should return organizations's address if organization exists in database", async () => {
      const address = await plant.organizations.address('origin')

      address.should.equal(origin.address)
    })

    it('it should return undefined if organization does not exist in database', async () => {
      const address = await plant.organizations.address('doesnotexist')
      const type = typeof address

      type.should.equal('undefined')
    })
  })
})
