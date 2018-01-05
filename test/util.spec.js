/* eslint-env mocha */
'use strict'

const loadFixture = require('aegir/fixtures')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const IpldBitcoin = require('../src/index')

describe('IPLD format util API', () => {
  const fixtureBlockHex = loadFixture(__dirname, 'fixtures/block.hex')
  const fixtureBlock = Buffer.from(fixtureBlockHex.toString(), 'hex')

  it('should deserialize correctly', (done) => {
    IpldBitcoin.util.deserialize(fixtureBlock, (err, dagNode) => {
      expect(err).to.not.exist()
      expect(dagNode.version).to.equal(2)
      expect(dagNode.prevHash.toString('hex')).to.equal(
        '87d6242b27d248a9e145fe764a0bcef03a403883a2e4c8590200000000000000')
      expect(dagNode.merkleRoot.toString('hex')).to.equal(
        '11a5b9a70acebedbbf71ef8ca341e8a98cf279c49eee8f92e10a2227743b6aeb')
      expect(dagNode.timestamp).to.equal(1386981279)
      expect(dagNode.bits).to.equal(419740270)
      expect(dagNode.nonce).to.equal(3159344128)
      done()
    })
  })

  it('should round-trip (de)serialization correctly', (done) => {
    IpldBitcoin.util.deserialize(fixtureBlock, (err, dagNode) => {
      expect(err).to.not.exist()
      IpldBitcoin.util.serialize(dagNode, (err, binaryBlob) => {
        expect(err).to.not.exist()
        expect(binaryBlob.equals(fixtureBlock)).to.be.true()
        done()
      })
    })
  })

  it('should encode the CID correctly', (done) => {
    IpldBitcoin.util.deserialize(fixtureBlock, (err, dagNode) => {
      expect(err).to.not.exist()
      IpldBitcoin.util.cid(dagNode, (err, cid) => {
        expect(err).to.not.exist()
        expect(cid.multihash.toString('hex')).to.equal(
          '56203ec2c691d447b2fd0d6a94742345af1f351037dab1ab9e900200000000000000')
        done()
      })
    })
  })
})
