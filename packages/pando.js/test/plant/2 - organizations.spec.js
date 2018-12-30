import chai from 'chai'
import fs from 'fs-extra'
import path from 'path'
import capture from 'collect-console'
import promised from 'chai-as-promised'
import Web3 from 'web3'
import Pando from '../../lib'

import { fixtures } from '@pando/helpers/fixtures'
import { options } from '@pando/helpers/options'

// const options2 = { ethereum: { account: '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7', gateway: { protocol: 'ws', host: 'localhost', port: '8545'} } }


chai.use(promised)
const should = chai.should()


describe('pando/organizations', () => {
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

  // describe('#deploy', () => {
  //   before(async () => {
  //     await initialize()
  //   })
  //
  //   after(async () => {
  //     console.log('AFTER')
  //     await clean()
  //   })
  //
  //   it('it should return true if plant exists', async () => {
  //     const organization = await plant.organizations.deploy()
  //     console.log('On a organization')
  //
  //     organization.kernel.address.should.exist
  //     organization.acl.address.should.exist
  //     organization.colony.address.should.exist
  //     organization.scheme.address.should.exist
  //
  //
  //     // console.log(organization.kernel.address)
  //   })
  //
  // })

  describe('#create', () => {
    let organization

    before(async () => {
      await initialize()
    })

    after(async () => {
      await clean()
    })

    it('it should deploy organization', async () => {
      organization = await plant.organizations.create('origin')

      organization.should.exist
    })

    it('it should initialize organization', async () => {
      organization.kernel.address.should.exist
      organization.acl.address.should.exist
      organization.colony.address.should.exist
      organization.scheme.address.should.exist
    })

  })

  // describe('#load', () => {
  //   let organization
  //
  //   before(async () => {
  //     await initialize()
  //   })
  //
  //   after(async () => {
  //     await clean()
  //   })
  //
  //   it('it should return organization', async () => {
  //     organization = await plant.organizations.load('origin')
  //
  //     organization.should.exist
  //   })
  //
  //   it('it should initialize organization', async () => {
  //     organization.kernel.address.should.exist
  //     organization.acl.address.should.exist
  //     organization.colony.address.should.exist
  //     organization.scheme.address.should.exist
  //   })
  //
  // })

  describe('#address', () => {
    let origin
    before(async () => {
      await initialize()
      origin = await plant.organizations.create('origin')
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
