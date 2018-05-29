/* eslint-env mocha */
'use strict'

const loadFixture = require('aegir/fixtures')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const IpldBitcoin = require('../src/index')

const snapshot = {
  '@type': 'snapshot',
  author: { account : '0x' }
}

const snapshotNode = Buffer.from(JSON.stringify(snapshot))

const expectedCid = '1b2e7b224074797065223a22736e617073686f74222c22617574686f72223a7b226163636f756e74223a223078227d7d'

// const fixtureBlockHex = loadFixture('test/fixtures/block.hex')
// const fixtureBlock = Buffer.from(fixtureBlockHex.toString(), 'hex')
// const invalidDagNode = {invalid: 'dagNode'}

describe('IPLD format util API deserialize()', () => {
  it('should work correctly', (done) => {
    IpldBitcoin.util.deserialize(snapshotNode, (err, dagNode) => {
      expect(err).to.not.exist()
      expect(dagNode.author.account).to.equal('0x')
      done()
    })
  })
})

describe('IPLD format util API serialize()', () => {
  it('should round-trip (de)serialization correctly', (done) => {
    IpldBitcoin.util.deserialize(snapshotNode, (err, dagNode) => {
      expect(err).to.not.exist()
      IpldBitcoin.util.serialize(dagNode, (err, binaryBlob) => {
        expect(err).to.not.exist()
        expect(binaryBlob).to.deep.equal(snapshotNode)
        done()
      })
    })
  })

  // it('should error on an invalid internal representation', (done) => {
  //   IpldBitcoin.util.serialize(invalidDagNode, (err, binaryBlob) => {
  //     expect(binaryBlob).to.not.exist()
  //     expect(err).to.be.an('error')
  //     done()
  //   })
  // })
})

describe('IPLD format util API cid()', () => {
  it('should encode the CID correctly', (done) => {
    
    IpldBitcoin.util.cid(snapshot, (err, cid) => {
      // See https://github.com/ipld/js-cid/blob/4d7bcf860214fef04700ebe338908d36182c931e/src/index.js#L123 for the problem
      // One solution is to present us as raw and reimplment raw 
      expect(err).to.not.exist()
      console.log(cid.codec)
      console.log(cid.version)
      console.log(cid.toBaseEncodedString())
      expect(cid.multihash.toString('hex')).to.equal(expectedCid)
      done()
    })
    
    
    // IpldBitcoin.util.deserialize(fixtureBlock, (err, dagNode) => {
    //   expect(err).to.not.exist()
    //   verifyCid(
    //     dagNode,
    //     '56203ec2c691d447b2fd0d6a94742345af1f351037dab1ab9e900200000000000000',
    //     done)
    // })
  })

  // it('should error on an invalid internal representation', (done) => {
  //   IpldBitcoin.util.cid(invalidDagNode, (err, cid) => {
  //     expect(cid).to.not.exist()
  //     expect(err).to.be.an('error')
  //     done()
  //   })
  // })
})

const verifyBlock = (dagNode, expected) => {
  expect(dagNode.version).to.equal(expected.version)
  expect(dagNode.prevHash.toString('hex')).to.equal(expected.prevHash)
  expect(dagNode.merkleRoot.toString('hex')).to.equal(expected.merkleRoot)
  expect(dagNode.timestamp).to.equal(expected.timestamp)
  expect(dagNode.bits).to.equal(expected.bits)
  expect(dagNode.nonce).to.equal(expected.nonce)
}

const verifyCid = (dagNode, expectedCid, doneCb) => {
  IpldBitcoin.util.cid(dagNode, (err, cid) => {
    expect(err).to.not.exist()
    console.log(cid.multihash)
    expect(cid.multihash.toString('hex')).to.equal(expectedCid)
    doneCb()
  })
}
