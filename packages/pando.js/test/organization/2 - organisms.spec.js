import chai from 'chai'
import fs from 'fs-extra'
import path from 'path'
import capture from 'collect-console'
import promised from 'chai-as-promised'
import Web3 from 'web3'
import Pando from '../../lib'

chai.use(promised)
const should = chai.should()

import { ADDR_NULL } from '@pando/helpers/address'
import { fixtures } from '@pando/helpers/fixtures'
import { options } from '@pando/helpers/options'

describe('organization/organisms', () => {
  let pando, plant, organization

  const initialize = async () => {
    pando = await Pando.create(options)
    plant = await pando.plants.create(path.join('test', 'fixtures'))
    organization = await plant.organizations.deploy('origin')
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
    let organism

    before(async () => {
      await initialize()
      organism = await organization.organisms.deploy('awesomeorganism')
    })

    after(async () => {
      await clean()
    })

    describe('with name', () => {
      it('it should return true if organisms exists in database', async () => {
        const exists = await organization.organisms.exists({ name: 'awesomeorganism' })

        exists.should.equal(true)
      })

      it('it should return false if organisms does not exist in database', async () => {
        const exists = await organization.organisms.exists({ name: 'doesnotexist' })

        exists.should.equal(false)
      })
    })

    describe('with address', () => {
      it('it should return true if organisms exists in database', async () => {
        const exists = await organization.organisms.exists({ address: organism.address })

        exists.should.equal(true)
      })

      it('it should return false if organisms does not exist in database', async () => {
        const exists = await organization.organisms.exists({ address: 'doesnotexist' })

        exists.should.equal(false)
      })
    })
  })

  describe('#deploy', () => {
    let organism

    before(async () => {
      await initialize()
    })

    after(async () => {
      await clean()
    })

    it('it should deploy and return organism', async () => {
      organism = await organization.organisms.deploy('awesomeorganism')

      organism.should.exist
    })

    it('it should initialize organism', async () => {
      organism.address.should.not.equal(ADDR_NULL)
      organism.organization.should.deep.equal(organization)
    })

    it('it should save organism into database', async () => {
      let loaded = await organization.organisms.load({ name: 'awesomeorganism' })

      loaded.address.should.equal(organism.address)
    })

    it("it should reject with error E_ORGANISM_NAME_ALREADY_EXISTS if organism's name already exists", async () => {
      return organization.organisms.deploy('awesomeorganism').should.be.rejectedWith('E_ORGANISM_NAME_ALREADY_EXISTS')
    })
  })

  describe('#add', () => {
    let organism_1, organism_2, organism

    before(async () => {
      await initialize()
      organism_1 = await organization.organisms.deploy('organism_1')
      organism_2 = await organization.organisms.deploy('organism_2')
      // Nasty trick to clean database while organizations still being deployed
      await organization.organisms.delete({ name: 'organism_1' })
      await organization.organisms.delete({ name: 'organism_2' })
    })

    after(async () => {
      await clean()
    })

    it('it should return organism', async () => {
      organism = await organization.organisms.add('awesomeorganism', organism_1.address)

      organism.should.exist
    })

    it('it should initialize organism', async () => {
      organism.address.should.not.equal(ADDR_NULL)
      organism.organization.should.deep.equal(organization)
    })

    it('it should save organism into database', async () => {
      const loaded = await organization.organisms.load({ name: 'awesomeorganism' })

      loaded.address.should.not.equal(organization.address)
    })

    it("it should reject with error E_ORGANISM_NAME_ALREADY_EXISTS if organism's name already exists", async () => {
      return organization.organisms.add('awesomeorganism', organism_2.address).should.be.rejectedWith('E_ORGANISM_NAME_ALREADY_EXISTS')
    })

    it("it should reject with error E_ORGANISM_ALREADY_EXISTS if organism's address already exists", async () => {
      return organization.organisms.add('notawesomeorganism', organism.address).should.be.rejectedWith('E_ORGANISM_ALREADY_EXISTS')
    })
  })

  describe('#load', () => {
    let organism_1, organism

    before(async () => {
      await initialize()
      organism_1 = await organization.organisms.deploy('organism_1')
    })

    after(async () => {
      await clean()
    })

    describe('with name', () => {
      it('it should return organization', async () => {
        organism = await organization.organisms.load({ name: 'organism_1' })

        organism.should.exist
      })

      it('it should initialize organization', async () => {
        organism.address.should.not.equal(ADDR_NULL)
        organism.organization.should.deep.equal(organization)
      })

      it('it should reject with error E_ORGANISM_NOT_FOUND if organism does not exist', async () => {
        return organization.organisms.load({ name: 'doesnotexist' }).should.be.rejectedWith('E_ORGANISM_NOT_FOUND')
      })
    })

    describe('with address', () => {
      it('it should return organization', async () => {
        organism = await organization.organisms.load({ address: organism_1.address })

        organism.should.exist
      })

      it('it should initialize organization', async () => {
        organism.address.should.not.equal(ADDR_NULL)
        organism.organization.should.deep.equal(organization)
      })

      it('it should reject with error E_ORGANISM_NOT_FOUND if organism does not exist', async () => {
        return organization.organisms.load({ address: 'doesnotexist' }).should.be.rejectedWith('E_ORGANISM_NOT_FOUND')
      })
    })
  })

  describe('#address', () => {
    let organism

    before(async () => {
      await initialize()
      organism = await organization.organisms.deploy('awesomeorganism')
    })

    after(async () => {
      await clean()
    })

    it("it should return organism's address if organization exists in database", async () => {
      const address = await organization.organisms.address('awesomeorganism')

      address.should.equal(organism.address)
    })

    it('it should return undefined if orgaism does not exist in database', async () => {
      const address = await organization.organisms.address('doesnotexist')
      const type = typeof address

      type.should.equal('undefined')
    })
  })
})
