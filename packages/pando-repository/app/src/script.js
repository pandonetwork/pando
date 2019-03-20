import Aragon from "@aragon/client";

const app = new Aragon();

app.store(async (state, event) => {
  if (state === null) {
    state = { branches: {} };
  }

  switch (event.event) {
    case "UpdateRef":
      state.branches[branchFromRef(event.returnValues.ref)] =
        event.returnValues.hash;
      return state;
    default:
      return state;
  }
});

const branchFromRef = ref => {
  return ref.split("/")[2];
};
