import '@babel/polyfill'
import Aragon from '@aragon/client'
import IPFS from 'ipfs-http-client'
import Organism from '../build/contracts/Organism.json'

const app = new Aragon()
const ipfs = IPFS({ host: 'localhost', port: '5001', protocol: 'http' })

app.store(async (state, event) => {
  if (!state) {
    state = { organisms: [] }
  }

  console.log('State from script')
  console.log(state)

  switch (event.event) {
    case 'DeployOrganism':
      console.log('New event DeployOrganism')
      state.organisms.push(await getOrganism(event.returnValues.organism))
      console.log(state.organisms)
      return state
    default:
      return state
  }
})

function getOrganism(address) {
  return new Promise((resolve, reject) => {
    const organism = app.external(address, Organism.abi)

    console.log(organism)

    organism.RFIsLength().subscribe(length => {
      if (length > 0) {
        organism.getRFIMetadata(length).subscribe(async hash => {
          console.log('Getting getRFIMetadata: ' + hash)
          const metadata = (await ipfs.dag.get(hash)).value
          const files = await ipfs.ls(metadata.tree)
          console.log('Gonna resolve with : ' + { address: address, message: metadata.message, files: files })
          resolve({ address: address, message: metadata.message, files: files })
        })
      } else {
        resolve({ address: address, message: undefined, files: undefined })
      }
    })
  })
}
