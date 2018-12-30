import chai from 'chai'
import Web3 from 'web3'
import Pando from '../../lib'
import { options } from '@pando/helpers/options'

const should = chai.should()


describe('pando', () => {
  let pando

  after(async () => {
    await pando.close()
  })

  describe('#create', () => {
    it('it should return pando', async () => {
      pando = await Pando.create(options)

      pando.should.exist
    })

    it("it should initialize pando", async () => {
      pando.options.ethereum.account.should.equal(options.ethereum.account)
      pando.options.ethereum.provider.connection._url.should.equal('ws://localhost:8545')

      pando.options.apm.ens.should.equal('0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1')

      pando.plants.should.exist
      pando.plants.pando.should.equal(pando)

      pando.contracts.should.exist
      pando.contracts.Kernel.currentProvider.connection._url.should.equal('ws://localhost:8545')
      pando.contracts.ACL.currentProvider.connection._url.should.equal('ws://localhost:8545')
      pando.contracts.Lineage.currentProvider.connection._url.should.equal('ws://localhost:8545')
      pando.contracts.Genesis.currentProvider.connection._url.should.equal('ws://localhost:8545')
      pando.contracts.Organism.currentProvider.connection._url.should.equal('ws://localhost:8545')
      pando.contracts.OrganizationFactory.currentProvider.connection._url.should.equal('ws://localhost:8545')
    })

    describe('a custom gateway is passed in options', () => {
      before(async() => {
        await pando.close()
      })

      it("it should set options accordingly", async () => {
        pando = await Pando.create({ ethereum: { account: options.ethereum.account, gateway: { protocol: 'ws', host: '192.168.0.1', port: '8546' } } })

        pando.options.ethereum.account.should.equal(options.ethereum.account)
        pando.options.ethereum.provider.connection._url.should.equal('ws://192.168.0.1:8546')
        pando.options.apm.ens.should.equal('0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1')
      })
    })

    describe('a custom provider is passed in options', () => {
      it("it should set options accordingly", async () => {
        pando = await Pando.create({ ethereum: { account: options.ethereum.account, provider: new Web3.providers.HttpProvider('http://localhost:8546') } })

        pando.options.ethereum.account.should.equal(options.ethereum.account)
        pando.options.ethereum.provider.host.should.equal('http://localhost:8546')
        pando.options.apm.ens.should.equal('0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1')
      })
    })

    describe('a custom apm ens registry is passed in options', () => {
      it("it should set options accordingly", async () => {
        pando = await Pando.create({ ethereum: { account: options.ethereum.account }, apm: { ens: '0x0' } })

        pando.options.ethereum.account.should.equal(options.ethereum.account)
        pando.options.ethereum.provider.connection._url.should.equal('ws://localhost:8545')
        pando.options.apm.ens.should.equal('0x0')
      })
    })
  })
})
