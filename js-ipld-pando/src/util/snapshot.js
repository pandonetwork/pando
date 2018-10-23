'use strict'

const Snapshot = require('@wespr/pando').Snapshot
const setImmediate = require('async/setImmediate')
const SmartBuffer = require('smart-buffer').SmartBuffer
const util = require('../util')

exports = module.exports

exports.serialize = (snapshotNode, callback) => {
  if (! snapshotNode instanceof Snapshot) {
    callback(new TypeError('Invalid snapshot node'))
  }

  let ipld = {
    '@type':   'snapshot',
    timestamp: snapshotNode.timestamp,
    parents:   [],
    tree:      {},
    author:    snapshotNode.author,
    message:   snapshotNode.message
  }
  
  util.cid(snapshotNode.tree, (err, cid) => {
    if (err) {
      callback(err)
    }
    ipld.tree = { '/': cid.toBaseEncodedString() }
    callback(null, ipld)
  })
}

exports.deserialize = (data, callback) => {

}