import Aragon from "@aragon/client";

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
  state = state ? state : { branches: {}, name: '', description: '' }

  switch (event.event) {
    case "UpdateRef":
      state.branches[branchFromRef(event.returnValues.ref)] =
        event.returnValues.hash
      return state
    case "UpdateInformations":
      state.name = event.returnValues.name
      state.description = event.returnValues.description
      return state
    default:
      return state
  }
})

const branchFromRef = ref => {
  return ref.split("/")[2]
}
