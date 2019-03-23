import Aragon from '@aragon/api'

const app = new Aragon()

app.store(async (state, event) => {
  if (state === null) state = { repos: [], cache: {} }

  if (!state.cache[event.id]) {
    state.cache[event.id] = true

    switch (event.event) {
      case 'CreateRepository':
        state.repos.push(event.returnValues.repository)
        return state
      default:
        return state
    }
  }

  return state
})
