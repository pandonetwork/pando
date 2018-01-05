'use strict'

const BitcoinjsBlock = require('bitcoinjs-lib').Block
const CID = require('cids')
const multihashes = require('multihashes')
const sha256 = require('hash.js/lib/hash/sha/256')

const serialize = (dagNode, callback) => {
  const binaryBlob = dagNode.toBuffer()
  const err = null
  callback(err, binaryBlob)
}

const deserialize = (binaryBlob, callback) => {
  const dagNode = BitcoinjsBlock.fromBuffer(binaryBlob)
  const err = null
  callback(err, dagNode)
}

const cid = (dagNode, callback) => {
  // Bitcoin double hashes
  const firstHash = sha256().update(dagNode.toBuffer(true)).digest()
  const headerHash = sha256().update(Buffer.from(firstHash)).digest()

  const multihash = multihashes.encode(Buffer.from(headerHash), 'dbl-sha2-256')
  const cidVersion = 1
  const cid = new CID(cidVersion, 'bitcoin-block', multihash)
  const err = null
  callback(err, cid)
}

module.exports = {
  cid: cid,
  deserialize: deserialize,
  serialize: serialize
}
