/* eslint-disable import/no-duplicates */
import Pando from '../../lib'
import chai from 'chai'
import promised from 'chai-as-promised'

chai.use(promised)
const expect = chai.expect
const should = chai.should()

import { options } from '@pando/helpers/options'

describe('organization', () => {
  let pando

  const initialize = async () => {
    pando = await Pando.create(options)
  }

  describe('#constructor', () => {})
})
