/* eslint-disable import/no-duplicates */
import Pando from '../lib/pando.js'
import { Repository } from '../lib/pando.js'
/* eslint-enable import/no-duplicates */
import { opts, cids } from './data'
import * as utils from './utils'
import chai from 'chai'
import npath from 'path'
import IPFS from 'ipfs'
import IPFS_API from 'ipfs-api'
import 'chai/register-should'
import promisify from 'promisify-event'

chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))

const expect = chai.expect

describe('Repository', () => {
  let pando, repository, ipfs, ipfs2, snapshot, cid

  before(async () => {
    pando = Pando.create(opts)
    repository = await pando.repositories.create(npath.join('test', 'mocks'))
    console.log('repo created')
    await repository.stage(['test/mocks/test.md'])
    console.log('stagef')
    snapshot = await repository.snapshot('Message')
    console.log('snapshot ik')
    cid = await snapshot.cid()
    console.log('cid ik')
    ipfs2 = IPFS_API('ipfs.infura.io', '5001', { protocol: 'https' })
    console.log('Infura ok')
    console.log(cid.toBaseEncodedString())

    const ts = await ipld2.dag.put(await snapshot.toIPLD(), {
      format: 'dag-cbor',
      hashAlg: 'keccak-256'
    })

    console.log(ts)

    // await repository.remotes.deploy('origin')
    //
    // await repository.push('origin', 'master')

    ipfs = new IPFS({
      EXPERIMENTAL: {
        pubsub: true, // enable pubsub
        relay: {
          enabled: true, // enable relay dialer/listener (STOP)
          hop: {
            enabled: true // make this node a relay (HOP)
          }
        }
      }
      // start: false
    })

    await promisify(ipfs, 'ready')
  })

  after(async () => {
    await Repository.remove(npath.join('test', 'mocks'))
  })

  describe('static#exists', async () => {
    it('should test', async () => {
      // await ipfs.start()
      let toto = await ipfs.dag.get(cid)
      console.log(toto)

      setInterval(async () => {
        try {
          let toto = await ipfs.dag.get(cid)
          console.log(toto)
        } catch (e) {
          console.error(e)
        }
      }, 1000)

      // let toto = await ipfs.dag.get(cid)
    })
  })
})
