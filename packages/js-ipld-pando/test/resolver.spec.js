/* eslint-env mocha */
'use strict'

// const loadFixture = require('aegir/fixtures')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
// const CID = require('cids')
const IpldBitcoin = require('../src/index')

const snapshot = {
  '@type': 'snapshot',
  timestamp: '',
  author: { account: '0x' },
  // tree: { '/': new CID('') },
  // parents: [{ '/': new CID('') }, { '/': new CID('') }],
  message: 'First snapshot'
}

const snapshotNode = Buffer.from(JSON.stringify(snapshot))

describe('IPLD format resolver API resolve()', () => {
  it('should return the deserialized node if no path is given', (done) => {
    IpldBitcoin.resolver.resolve(snapshotNode, (err, value) => {
      expect(err).to.not.exist()
      expect(value.remainderPath).is.empty()
      expect(value.value).is.not.empty()
      done()
    })
  })

  it('should return the deserialized node if path is empty', (done) => {
    IpldBitcoin.resolver.resolve(snapshotNode, '', (err, value) => {
      expect(err).to.not.exist()
      expect(value.remainderPath).is.empty()
      expect(value.value).is.not.empty()
      done()
    })
  })
  //
  // it('should return the type', (done) => {
  //   verifyPath(snapshotNode, '@type', 'snapshot', done)
  // })
  //
  // it('should return the author', (done) => {
  //   verifyPath(snapshotNode, 'author', {account: '0x'}, done)
  // })
  //
  // it('should return the author account', (done) => {
  //   verifyPath(snapshotNode, 'author/account', '0x', done)
  // })

  // it('should return the difficulty', (done) => {
  //   verifyPath(snapshotNode, 'difficulty', 419740270, done)
  // })
  //
  // it('should return the nonce', (done) => {
  //   verifyPath(snapshotNode, 'nonce', 3159344128, done)
  // })
  //
  // it('should error on non-existent path', (done) => {
  //   verifyError(snapshotNode, 'something/random', done)
  // })
  //
  // it('should error on path starting with a slash', (done) => {
  //   verifyError(fixtureBlock, '/version', done)
  // })
  // it('should error on partially matching path that isn\'t a link', (done) => {
  //   verifyError(fixtureBlock, 'version/but/additional/things', done)
  // })
  //
  // it('should return a link when parent is requested', (done) => {
  //   IpldBitcoin.resolver.resolve(fixtureBlock, 'parents/0', (err, value) => {
  //     expect(err).to.not.exist()
  //     expect(value.remainderPath).is.empty()
  //     expect(value.value).to.deep.equal({
  //       '/': new CID('z4HFzdHLxSgJvCMJrsDtV7MgqiGALZdbbxgcTLVUUXQGBkGYjLb')})
  //     done()
  //   })
  // })
  //
  // it('should return a link and remaining path when parent is requested',
  //   (done) => {
  //     IpldBitcoin.resolver.resolve(fixtureBlock, 'parent/timestamp',
  //       (err, value) => {
  //         expect(err).to.not.exist()
  //         expect(value.remainderPath).to.equal('timestamp')
  //         expect(value.value).to.deep.equal({
  //           '/':
  //             new CID('z4HFzdHLxSgJvCMJrsDtV7MgqiGALZdbbxgcTLVUUXQGBkGYjLb')})
  //         done()
  //       })
  //   })
  //
  // it('should return a link when transactions are requested', (done) => {
  //   IpldBitcoin.resolver.resolve(fixtureBlock, 'tx/some/remainder',
  //     (err, value) => {
  //       expect(err).to.not.exist()
  //       expect(value.remainderPath).to.equal('some/remainder')
  //       expect(value.value).to.deep.equal({
  //         '/': new CID('z4HFzdHD15kVvtmVzeD7z9sisZ7acSC88wXS3KJGwGrnr2DwcVQ')})
  //       done()
  //     })
  // })
  //
  // it('should return an error if block is invalid', (done) => {
  //   verifyError(invalidBlock, 'version', done)
  // })
})

// describe('IPLD format resolver API tree()', () => {
//   it('should return only paths by default', (done) => {
//     IpldBitcoin.resolver.tree(fixtureBlock, (err, value) => {
//       expect(err).to.not.exist()
//       expect(value).to.deep.equal(['version', 'timestamp', 'difficulty',
//         'nonce', 'parent', 'tx'])
//       done()
//     })
//   })
//
//   it('should be able to return paths and values', (done) => {
//     IpldBitcoin.resolver.tree(fixtureBlock, {values: true}, (err, value) => {
//       expect(err).to.not.exist()
//       expect(value).to.deep.equal({
//         version: 2,
//         timestamp: 1386981279,
//         difficulty: 419740270,
//         nonce: 3159344128,
//         parent: {
//           '/': new CID('z4HFzdHLxSgJvCMJrsDtV7MgqiGALZdbbxgcTLVUUXQGBkGYjLb')},
//         tx: {
//           '/': new CID('z4HFzdHD15kVvtmVzeD7z9sisZ7acSC88wXS3KJGwGrnr2DwcVQ')}})
//       done()
//     })
//   })
//
//   it('should return an error if block is invalid', (done) => {
//     IpldBitcoin.resolver.tree(invalidBlock, (err, value) => {
//       expect(value).to.not.exist()
//       expect(err).to.be.an('error')
//       done()
//     })
//   })
// })

// describe('IPLD format resolver API properties', () => {
//   it('should have `multicodec` defined correctly', (done) => {
//     expect(IpldBitcoin.resolver.multicodec).to.equal('pando')
//     done()
//   })
// })

// const verifyPath = (block, path, expected, done) => {
//   IpldBitcoin.resolver.resolve(block, path, (err, value) => {
//     expect(err).to.not.exist()
//     expect(value.remainderPath).is.empty()
//     expect(value.value).is.equal(expected)
//     done()
//   })
// }
//
// const verifyError = (block, path, done) => {
//   IpldBitcoin.resolver.resolve(block, path, (err, value) => {
//     expect(value).to.not.exist()
//     expect(err).to.be.an('error')
//     done()
//   })
// }
