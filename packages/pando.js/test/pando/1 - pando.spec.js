import chai from 'chai'
import Web3 from 'web3'
import Pando from '../../lib'
import { options } from '@pando/helpers/options'

const should = chai.should()


describe('@pando/pando.js', () => {
  let pando

  const initialize = async () => {
    pando = await Pando.create()
  }

  describe('#create', () => {
    it('it should return pando object', async () => {
      pando = await Pando.create(options)

      pando.should.exist
    })

    it("it should initialize pando's object", async () => {
      pando.options.ethereum.account.should.equal(options.ethereum.account)
      pando.options.ethereum.provider.host.should.equal('http://localhost:8545')
      pando.options.apm.ens.should.equal('0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1')

      pando.organizations.should.exist
      pando.organizations.pando.should.equal(pando)
      pando.plants.should.exist
      pando.plants.pando.should.equal(pando)

      pando.contracts.should.exist
      pando.contracts.Kernel.currentProvider.host.should.equal('http://localhost:8545')
      pando.contracts.ACL.currentProvider.host.should.equal('http://localhost:8545')
      pando.contracts.Lineage.currentProvider.host.should.equal('http://localhost:8545')
      pando.contracts.Genesis.currentProvider.host.should.equal('http://localhost:8545')
      pando.contracts.Organism.currentProvider.host.should.equal('http://localhost:8545')
      pando.contracts.OrganizationFactory.currentProvider.host.should.equal('http://localhost:8545')
    })

    describe('a custom gateway is passed in options', () => {
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
        pando.options.ethereum.provider.host.should.equal('http://localhost:8545')
        pando.options.apm.ens.should.equal('0x0')
      })
    })
  })
})
