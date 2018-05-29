'use strict'
// const promisify = require('util').promisify
// const BitcoinjsBlock = require('bitcoinjs-lib').Block
const CID = require('cids')
// const multihashes = require('multihashes')
const multihashing = require('multihashing-async')
// const sha256 = require('hash.js/lib/hash/sha/256')

const serialize = (node, callback) => {
  let binary = Buffer.from(JSON.stringify(node))
  callback(null, binary)
}

const deserialize = (binary, callback) => {
  let node = JSON.parse(binary.toString())
  callback(null, node)  
}

const cid = (node, callback) => {
  serialize(node, (err, binary) => {
    if(err) {
      callback(err)
    } else {
      multihashing(binary, 'keccak-256', (err, multihash) => {
        let cid = new CID(1, 'raw', multihash)
        callback(null, cid)
      })
    }
  })

}

module.exports = {
  cid: cid,
  deserialize: deserialize,
  serialize: serialize
}
