import Aragon from '@aragon/client'

export const app = new Aragon()

app.store(async (state, event) => {
  if (state === null) {
    state = { branches: {} }
  }

  console.log('hello world', app)
  console.log('some event..', event)

  switch (event.event) {
    case 'UpdateRef':
      state.branches[branchFromRef(event.returnValues.ref)] =
        event.returnValues.hash
      return state
    default:
      return state
  }
})

const branchFromRef = ref => {
  return ref.split('/')[2]
}
