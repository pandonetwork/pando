import Aragon from '@aragon/client'
import PandoRepository from '../../build/contracts/PandoRepository.json'

const app = new Aragon()

export let repoCache = {}
export let repoState = {}

app.store(async (state, event) => {
  if (!state) {
    state = { repos: [], cache: {} }
  }

  console.log('event..', event)

  if (!state.cache[event.id]) {
    state.cache[event.id] = true

    switch (event.event) {
      case 'CreateRepository':
        const address = event.returnValues.repository
        // let result = await getRepo(address)
        // result.address = address
        state.repos.push(address)
        console.log('state..', state)
        return state
      default:
        return state
    }
  }

  console.log('state..', state)

  return state
})

function getRepo(address) {
  return new Promise(async (resolve, reject) => {
    const repo = app.external(address, PandoRepository.abi)

    repo.events().subscribe(event => {
      if (!repoCache[event.id]) {
        repoCache[event.id] = true
        repoState[address] = event.returnValues
      }
    })

    const name = await repo.name().toPromise()
    const description = await repo.description().toPromise()
    resolve({ name, description })
  })
}
