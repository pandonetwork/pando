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
    const value = resolveField(dagNode, pathArray[0])
    if (value === null) {
      return callback(new Error('No such path'), null)
    }

    let remainderPath = pathArray.slice(1).join('/')
    // It is a link, hence it may have a remainder
    if (value['/'] !== undefined) {
      return callback(null, {
        value: value,
        remainderPath: remainderPath
      })
    } else {
      if (remainderPath.length > 0) {
        return callback(new Error('No such path'), null)
      } else {
        return callback(null, {
          value: value,
          remainderPath: ''
        })
      }
    }
  })
}

const tree = (binaryBlob, options, callback) => {
  if (typeof options === 'function') {
    callback = options
    options = undefined
  }
  options = options || {}

  util.deserialize(binaryBlob, (err, dagNode) => {
    if (err) {
      return callback(err)
    }

    const paths = ['/version', '/timestamp', '/difficulty', '/nonce',
      '/parent', '/tx']

    if (options.values === true) {
      const pathValues = {}
      for (let path of paths) {
        pathValues[path] = resolveField(dagNode, path.substr(1))
      }
      return callback(null, pathValues)
    } else {
      return callback(null, paths)
    }
  })
}

// Return top-level fields. Returns `null` if field doesn't exist
const resolveField = (dagNode, field) => {
  switch (field) {
    case 'version':
      return dagNode.version
    case 'timestamp':
      return dagNode.timestamp
    case 'difficulty':
      return dagNode.bits
    case 'nonce':
      return dagNode.nonce
    case 'parent':
      return {'/': util.hashToCid(dagNode.prevHash)}
    case 'tx':
      return {'/': util.hashToCid(dagNode.merkleRoot)}
    default:
      return null
  }
}

module.exports = {
  resolve: resolve,
  tree: tree
}
