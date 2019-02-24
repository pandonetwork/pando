import Aragon from '@aragon/client'

const app = new Aragon()

app.store(async (state, event) => {
  switch (event.event) {
    case 'DeployOrganism':
      return state
    default:
      return state
  }
})
