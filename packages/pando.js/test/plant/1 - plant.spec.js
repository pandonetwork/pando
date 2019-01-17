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

describe('plant', () => {
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

  describe('#publish', () => {})

  describe('#delete', () => {})
})
