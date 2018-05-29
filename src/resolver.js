'use strict'

const util = require('./util')
const traverse = require('traverse')

const resolve = (binaryBlob, path, callback) => {
  if (typeof path === 'function') {
    callback = path
    path = undefined
  }

  util.deserialize(binaryBlob, (err, node) => {
    if (err) {
      return callback(err)
    }

    // Return the deserialized block if no path is given
    if (!path) {
      return callback(null, {
        value: node,
        remainderPath: ''
      })
    }
    
    // début pando
    
    if (Buffer.isBuffer(node)) { // pando blob
      return callback(null, {
        value: node,
        remainderPath: path
      })
    }
    const parts = path.split('/')
    const val = traverse(node).get(parts)

    if (val) {
      return callback(null, {
        value: val,
        remainderPath: ''
      })
    }

    let value
    let len = parts.length

    for (let i = 0; i < len; i++) {
      const partialPath = parts.shift()
    
      if (Array.isArray(node)) {
        value = node[Number(partialPath)]
      } if (node[partialPath]) {
        value = node[partialPath]
      } else {
        // can't traverse more
        if (!value) {
          return callback(new Error('path not available at root'))
        } else {
          parts.unshift(partialPath)
          return callback(null, {
            value: value,
            remainderPath: parts.join('/')
          })
        }
      }
      node = value
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

    // const paths = ['version', 'timestamp', 'difficulty', 'nonce',
    //   'parent', 'tx']

    let paths = []
    switch (node['@type']) {
      case 'snapshot':
        paths = [
          'timestamp',
          'tree',
          'author',
          'author/account',
          'message'
        ]
        paths = paths.concat(node.parents.map((_, e) => 'parents/' + e))
        break
      case 'tree':
        Object.keys(node).forEach(dir => {
          paths.push(dir)
          // paths.push(dir + '/hash')
          // paths.push(dir + '/mode')
        })
        break
      default:
        callback(new TypeError('Unknow pando object'))
    }
    callback(null, paths)

    // if (options.values === true) {
    //   const pathValues = {}
    //   for (let path of paths) {
    //     pathValues[path] = resolveField(dagNode, path)
    //   }
    //   return callback(null, pathValues)
    // } else {
    //   return callback(null, paths)
    // }
  })
}

module.exports = {
  multicodec: 'raw',
  resolve: resolve,
  tree: tree
}
