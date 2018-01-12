'use strict'

const util = require('./util')

const resolve = (binaryBlob, path, callback) => {
  if (typeof path === 'function') {
    callback = path
    path = undefined
  }

  util.deserialize(binaryBlob, (err, dagNode) => {
    if (err) {
      return callback(err)
    }

    // Requesting the root node returns the deserialized block
    if (!path || path === '/') {
      return callback(null, {
        value: dagNode,
        remainderPath: ''
      })
    }

    const pathArray = path.split('/')
    // `/` is the first element
    pathArray.shift()

    // The values that can directly be resolved
    let value
    // Links to other blocks
    let link
    switch (pathArray[0]) {
      case 'version':
        value = dagNode.version
        break
      case 'timestamp':
        value = dagNode.timestamp
        break
      case 'difficulty':
        value = dagNode.bits
        break
      case 'nonce':
        value = dagNode.nonce
        break
      case 'parent':
        link = dagNode.prevHash
        break
      case 'tx':
        link = dagNode.merkleRoot
        break
      default:
        return callback(new Error('No such path'), null)
    }

    let remainderPath = pathArray.slice(1).join('/')
    // Bitcoin has only top-level fields, every deeper nesting needs to
    // be a link
    if (value !== undefined) {
      if (remainderPath.length > 0) {
        return callback(new Error('No such path'), null)
      } else {
        return callback(null, {
          value: value,
          remainderPath: ''
        })
      }
    } else {
      // It's a link
      return callback(null, {
        value: {'/': util.hashToCid(link)},
        remainderPath: remainderPath
      })
    }
  })
}

module.exports = {
  resolve: resolve
}
