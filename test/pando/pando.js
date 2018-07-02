/* eslint-disable import/no-duplicates */
import Pando from '../../lib/pando.js'
import { Repository } from '../../lib/pando.js'
/* eslint-enable import/no-duplicates */
import { opts } from '../data'
import chai from 'chai'
import path from 'path'
import Web3 from 'Web3'
import 'chai/register-should'

chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))

const expect = chai.expect

Web3.providers.HttpProvider.prototype.sendAsync =
  Web3.providers.HttpProvider.prototype.send

describe('Pando', () => {
  describe('static#create', () => {
    let pando

    before(async () => {
      pando = Pando.create(opts)
    })

    it('should initialize pando correctly', () => {
      pando.should.exist()
    })

    it("should initialize pando's config correctly", () => {
      pando.config.author.should.deep.equal(opts.author)
      pando.config.ethereum.should.deep.equal(opts.ethereum)
    })

    it("should initialize pando's web3 correctly", () => {
      let provider = new Web3.providers.HttpProvider(opts.ethereum.gateway)
      pando.web3.currentProvider.should.be.deep.equal(provider)
    })

    it("should initialize pando's contracts correctly", () => {
      for (let name in Pando.contracts.artifacts) {
        pando.contracts[name].web3.currentProvider.provider.should.deep.equal(
          pando.web3.currentProvider
        )
      }
    })

    it("should initialize pando's repository factory correctly", () => {
      pando.repositories.pando.should.be.deep.equal(pando)
    })
  })

  describe('static#load', () => {
    let pando

    before(async () => {
      let original = Pando.create(opts)
      await original.repositories.create(path.join('test', 'mocks'))
      pando = Pando.load(path.join('test', 'mocks'))
    })

    after(async () => {
      await Repository.remove(path.join('test', 'mocks'))
    })

    it('should initialize pando correctly', () => {
      pando.should.exist()
    })

    it("should initialize pando's config correctly", () => {
      pando.config.author.should.be.deep.equal(opts.author)
      pando.config.ethereum.should.be.deep.equal(opts.ethereum)
    })

    it("should initialize pando's web3 correctly", () => {
      let provider = new Web3.providers.HttpProvider(opts.ethereum.gateway)
      pando.web3.currentProvider.should.deep.equal(provider)
    })

    it("should initialize pando's contracts correctly", () => {
      for (let name in Pando.contracts.artifacts) {
        pando.contracts[name].web3.currentProvider.provider.should.deep.equal(
          pando.web3.currentProvider
        )
      }
    })

    it('should initialize repository factory correctly', () => {
      pando.repositories.pando.should.deep.equal(pando)
    })

    it('should throw if repository does not exist', () => {
      expect(() => Pando.load('doesnotexist')).to.throw()
    })
  })
})
