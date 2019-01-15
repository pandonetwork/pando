import '@babel/polyfill'

import Aragon from '@aragon/client'
import IPFS from 'ipfs-http-client'

const app = new Aragon()
const ipfs = IPFS({ host: 'localhost', port: '5001', protocol: 'http' })

app.store(async (state, event) => {
  if (!state) {
    state = { rfiVotes: [], rflVotes: [], RFIs: [] }
  }

  console.log('event', event)

  switch (event.event) {
    case 'NewRFIVote':
      let rfiPayload = await getRFIVotes(
        event.returnValues.organism,
        event.returnValues.id
      )
      rfiPayload.organism = event.returnValues.organism
      state.rfiVotes.push(rfiPayload)
      // state.RFIs.push(
      //   await getRFIMetadata(event.returnValues.organism, event.returnValues.id)
      // )
      return state
    case 'NewRFLVote':
      let rflPayload = await getRFLVotes(
        event.returnValues.organism,
        event.returnValues.id
      )
      rflPayload.organism = event.returnValues.organism
      state.rflVotes.push(rflPayload)

      return state
    default:
      return state
  }
})

function getRFIVotes(organism, id) {
  return new Promise(resolve => {
    app.call('RFIVotes', organism, id).subscribe(resolve)
  })
}

function getRFLVotes(organism, id) {
  return new Promise(resolve => {
    app.call('RFLVotes', organism, id).subscribe(resolve)
  })
}

function getRFIMetadata(organism, id) {
  return new Promise(resolve => {
    app.call('getRFIMetadata', organism, id).subscribe(async hash => {
      console.log('hash', hash)
      const metadata = (await ipfs.dag.get(hash)).value
      const files = await ipfs.ls(metadata.tree)
      resolve({ message: metadata.message, files: files })
    })
  })
}
