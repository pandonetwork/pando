import Aragon from '@aragon/client'
import PandoRepository from '../../build/contracts/PandoRepository.json'

const app = new Aragon()

app.store(async (state, event) => {
  if (!state) {
    state = { repos: [], cache: {} }
  }

  if (!state.cache[event.id]) {
    state.cache[event.id] = true

    switch (event.event) {
      case 'CreateRepository':
        const address = event.returnValues.repository
        let result = await getRepo(address)
        result.address = address
        state.repos.push(result)
        return state
      default:
        return state
    }
  }

  return state
})

function getRepo(address) {
  return new Promise(async (resolve, reject) => {
    const repo = app.external(address, PandoRepository.abi)
    const name = await repo.name().toPromise()
    const description = await repo.description().toPromise()
    resolve({ name, description })
  })
}
