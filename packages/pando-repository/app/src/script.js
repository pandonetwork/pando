import Aragon from '@aragon/api'
import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
import { cidToSha } from 'ipld-git/src/util/util.js'
import orderBy from 'lodash.orderby'
import uniqWith from 'lodash.uniqwith'

const app = new Aragon()
const ipfs = IPFS({ host: 'localhost', port: '5001', protocol: 'http' })
const ipld = new IPLD({
  blockService: ipfs.block,
  formats: [IPLDGit],
})

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
  state = state || { branches: {}, name: '', description: '', cache: {} }

  if (!state.cache[event.id]) {
    state.cache[event.id] = true

    switch (event.event) {
      case 'UpdateRef':
        try {
          let history = await fetchHistory(event.returnValues.hash, [])
          history = uniqWith(history, (one, two) => {
            return one.cid === two.cid
          })
          history = orderBy(
            history,
            [
              commit => {
                // https://github.com/git/git/blob/v2.3.0/Documentation/date-formats.txt
                /* eslint-disable-next-line no-unused-vars */
                const [timestamp, offset] = commit.author.date.split(' ')
                return timestamp
              },
            ],
            ['desc']
          )
          state.branches[branchFromRef(event.returnValues.ref)] = history
        } catch (err) {
          console.error('Failed to load commit history due to:', err)
        }
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

const fetchHistory = async (hash, history) => {
  return new Promise((resolve, reject) => {
    try {
      const cid = new CID(hash)

      ipld.get(cid, async (err, result) => {
        if (err) {
          reject(err)
        } else {
          const commit = result.value
          commit.cid = cid.toBaseEncodedString()
          commit.sha = cidToSha(hash).toString('hex')

          history.push(commit)

          for (let parent of commit.parents) {
            history = await fetchHistory(parent['/'], history)
          }

          resolve(history)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}
