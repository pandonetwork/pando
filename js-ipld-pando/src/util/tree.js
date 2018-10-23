'use strict'

const Tree = require('@wespr/pando').Tree
const util = require('../util')

exports = module.exports

exports.serialize = (treeNode, callback) => {
  if (! treeNode instanceof Tree) {
    callback(new TypeError('Invalid tree node'))
  }
  
  let ipld = { '@type': 'tree' }
  
  let children = Object.keys(treeNode.children).map(child => treeNode.children[child])
  
  async.map(children, util.cid, function(err, cids) {
    // results is now an array of stats for each file
  })
}

exports.deserialize = (data, callback) => {

}