import '@babel/polyfill'

import Aragon from '@aragon/client'
import IPFS from 'ipfs-http-client'

const app = new Aragon()
const ipfs = IPFS({ host: 'localhost', port: '5001', protocol: 'http' })

app.store(async (state, event) => {
  if (!state) {
    state = { rfiVotes: [], RFIs: [] }
  }

  switch (event.event) {
    case 'NewRFIVote':
      state.rfiVotes.push(
        await getRFIVotes(event.returnValues.organism, event.returnValues.id)
      )
      state.RFIs.push(
        await getRFIMetadata(event.returnValues.organism, event.returnValues.id)
      )
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

function getRFIMetadata(organism, id) {
  return new Promise(resolve => {
    app
      .call('getRFIMetadata', organism, id)
      .subscribe(async (hash) => {
        const metadata = (await ipfs.dag.get(hash)).value
        const files = await ipfs.ls(metadata.tree)
        resolve({ message: metadata.message, files: files })
      })
  })
}
