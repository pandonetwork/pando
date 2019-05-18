import Aragon from '@aragon/api'
import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
import { cidToSha } from 'ipld-git/src/util/util.js'
import orderBy from 'lodash.orderby'
import uniqWith from 'lodash.uniqwith'

const PR_STATE = ['PENDING', 'MERGED', 'REJECTED'].reduce((state, key, index) => {
  state[key] = index
  return state
}, {})
const app = new Aragon()
const ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
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
  state = state || { branches: {}, PRs: {}, name: '', description: '', cache: {} }

  if (!state.cache[event.id]) {
    state.cache[event.id] = true

    switch (event.event) {
      case 'UpdateRef':
        try {
          let history = await fetchOrderedHistory(event.returnValues.hash, [])
          state.branches[branchFromRef(event.returnValues.ref)] = history
        } catch (err) {
          console.error('Failed to load commit history due to:', err)
        }
        return state
      case 'OpenPR':
        const PR = {
          id: event.returnValues.id,
          state: PR_STATE.PENDING,
          author: event.returnValues.author,
          title: event.returnValues.title,
          description: event.returnValues.description,
          destination: branchFromRef(event.returnValues.ref),
          hash: event.returnValues.hash,
          commit: await fetchCommit(event.returnValues.hash),
        }
        state.PRs[event.returnValues.id] = PR
        return state
      case 'MergePR':
        state.PRs[event.returnValues.id].state = PR_STATE.MERGED
        return state
      case 'RejectPR':
        state.PRs[event.returnValues.id].state = PR_STATE.REJECTED
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
  return new Promise(async (resolve, reject) => {
    try {
      const commit = await fetchCommit(hash)
      history.push(commit)

      for (let parent of commit.parents) {
        history = await fetchHistory(parent['/'], history)
      }

      resolve(history)
    } catch (err) {
      reject(err)
    }
  })
}

const fetchCommit = async hash => {
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
          commit.files = await fetchFilesFromTree(commit.tree['/'])
          console.log(commit)
          resolve(commit)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

const fetchFilesFromTree = (hash, path) => {
  return new Promise(async (resolve, reject) => {
    let files = {}
    const cid = new CID(hash)

    ipld.get(cid, async (err, result) => {
      if (err) {
        reject(err)
      } else {
        const tree = result.value
        for (let entry in tree) {
          const _path = path ? path + '/' + entry : entry
          if (tree[entry].mode === '40000') {
            const _files = await fetchFilesFromTree(tree[entry]['hash']['/'], _path)
            files = { ...files, ..._files }
          } else {
            files[_path] = new CID(tree[entry]['hash']['/']).toBaseEncodedString()
          }
        }
        resolve(files)
      }
    })
  })
}

const fetchOrderedHistory = async (hash, formerHistory) => {
  let history = await fetchHistory(hash, formerHistory)
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

  return history
}
