import Aragon from '@aragon/api'
import CID from 'cids'
import { cidToSha } from 'ipld-git/src/util/util.js'
import { Commit } from '../../../pando-lib/src/commit'
import { Branch } from '../../../pando-lib/src/branch'

const PR_STATE = ['PENDING', 'MERGED', 'REJECTED'].reduce((state, key, index) => {
  state[key] = index
  return state
}, {})
const app = new Aragon()

app
  .call('name')
  .toPromise()
  .then(name => {
    app.identify(name)
  })
  .catch(err => {
    console.error('Failed to load information to identify repository app due to:', err)
  })

app.store(async (state, event) => {
  state = state || { branches: {}, PRs: {}, name: '', description: '', cache: {} }

  if (!state.cache[event.id]) {
    state.cache[event.id] = true

    switch (event.event) {
      case 'UpdateRef':
        try {
          let branch = await Branch.get(new CID(event.returnValues.hash))
          let history = await branch.history
          state.branches[branchFromRef(event.returnValues.ref)] = history
        } catch (err) {
          console.error('Failed to load commit history due to:', err)
        }
        return state
      case 'OpenPR':
        const PR = {
          id: event.returnValues.id,
          state: PR_STATE.PENDING,
          author: event.returnValues.author,
          title: event.returnValues.title,
          description: event.returnValues.description,
          destination: branchFromRef(event.returnValues.ref),
          hash: event.returnValues.hash,
          commit: await Commit.get(new CID(event.returnValues.hash)),
        }
        state.PRs[event.returnValues.id] = PR
        return state
      case 'MergePR':
        state.PRs[event.returnValues.id].state = PR_STATE.MERGED
        return state
      case 'RejectPR':
        state.PRs[event.returnValues.id].state = PR_STATE.REJECTED
        return state
      case 'UpdateInformations':
        state.name = event.returnValues.name
        state.description = event.returnValues.description
        return state
      default:
        return state
    }
  }

  return state
})

const branchFromRef = ref => {
  return ref.split('/')[2]
}
