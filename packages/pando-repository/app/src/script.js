import Aragon from "@aragon/client";

const app = new Aragon();

app.store(async (state, event) => {
  if (state === null) {
    state = { branches: {}, name: '', description: '' }
  }

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
});

const branchFromRef = ref => {
  return ref.split("/")[2]
};
