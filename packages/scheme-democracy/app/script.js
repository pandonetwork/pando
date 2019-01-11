import '@babel/polyfill'

import Aragon from '@aragon/client'

const app = new Aragon()

app.store(async (state, event) => {
  if (!state) {
    state = { rfiVotes: [] }
  }

  switch (event.event) {
    case 'NewRFIVote':
      state.rfiVotes.push(
        await getRFIVotes(event.returnValues.organism, event.returnValues.id)
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
