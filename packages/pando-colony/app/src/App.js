import { Main, observe } from '@aragon/ui'
import React from 'react'
import Aragon from '@aragon/client'
import AppLayout from './components/AppLayout'
import NewRepositoryIcon from './components/NewRepositoryIcon'
import NewRepositorySidePanel from './components/NewRepositorySidePanel'
import EmptyState from './screens/EmptyState'
import Repositories from './screens/Repositories'
import PandoRepository from '../../build/contracts/PandoRepository.json'

// import { repoCache, repoState } from './script'

const app = new Aragon()

function loadRepoInformations(repoContract) {
  return new Promise((resolve, reject) => {
    repoContract
      .name()
      .first()
      .subscribe(resolve, reject)
  })
}

class App extends React.Component {
  static defaultProps = {
    repos: []
  }

  constructor(props) {
    super(props)

    this.state = {
      repos: [],
      sidePanelOpen: false
    }
  }

  componentWillReceiveProps(props) {
    const repos = []

    console.log('RECEIVE PROPS')

    for (const repo of props.repos) {
      console.log('From will receive props')
      console.log(repo)
      const contract = props.app.external(repo.address, PandoRepository.abi)

      this
        .loadRepoInformations(contract)
        .then(results => {
          const [name, description] = results
          console.log('NAME ' + name)
          console.log('Description ' + description)

          repos.push({ address: repo.address, name, description })
          this.setState({ repos })

        })
        .catch(err => {
          console.log('ERR: ' + err)
        })

    }
 }

  loadRepoName = repoContract => {
   return new Promise((resolve, reject) => {
     repoContract
       .name()
       .first()
       .subscribe(resolve, reject)
   })
  }

  loadRepoDescription = repoContract => {
   return new Promise((resolve, reject) => {
     repoContract
       .description()
       .first()
       .subscribe(resolve, reject)
   })
  }

  loadRepoInformations = repoContract => {
   return Promise.all([
     this.loadRepoName(repoContract),
     this.loadRepoDescription(repoContract)
   ])
  }

  handleMenuPanelOpen = () => {
    this.props.sendMessageToWrapper('menuPanel', true)
  }

  handleSidePanelOpen = () => {
    this.setState({ sidePanelOpen: true })
  }

  handleSidePanelClose = () => {
    this.setState({ sidePanelOpen: false })
  }

  handleCreateRepository = (name, description) => {
    this.props.app.createRepository(name, description)
  }

  render() {
    const { repos, sidePanelOpen } = this.state
    // const { sidePanelOpen } = this.state

    console.log('repo from props')
    console.log(repos)
    console.log('props')
    console.log(this.props)
    console.log('app')
    console.log(this.props.app.external)

    // console.log('repo cache...', repoCache)
    // console.log('repo state...', repoState)

    return (
      <div css="min-width: 320px">
        <Main>
          <AppLayout
            title="Colony"
            onMenuOpen={this.handleMenuPanelOpen}
            mainButton={{
              label: 'New repository',
              icon: <NewRepositoryIcon />,
              onClick: this.handleSidePanelOpen,
            }}
          >
            {repos.length > 0 ? (
              <Repositories repositories={repos} />
            ) : (
              <EmptyState onActivate={this.handleSidePanelOpen} />
            )}
          </AppLayout>

          <NewRepositorySidePanel
            opened={sidePanelOpen}
            onClose={this.handleSidePanelClose}
            onSubmit={this.handleCreateRepository}
          />
        </Main>
      </div>
    )
  }
}

export default observe(
  observable =>
    observable.map(state => {
      const { repos } = state
      console.log("repos from observable: ")
      console.log(repos)
      console.log('state from observable')
      console.log(observable)

      return {
        ...state,
        repos:
          repos && repos.length > 0
            ? repos.map(key => {
                return { address: key, name: '', description: '' }
              })
            : []
      }
    }),
  {}
)(App)
