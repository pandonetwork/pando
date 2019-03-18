import { Main } from '@aragon/ui'
import React from 'react'
import AppLayout from './components/AppLayout'
import NewRepositoryIcon from './components/NewRepositoryIcon'
import NewRepositorySidePanel from './components/NewRepositorySidePanel'
import EmptyState from './screens/EmptyState'
import Repositories from './screens/Repositories'
import { repoCache, repoState } from './script'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      sidePanelOpen: false,
    }
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
    const { repos } = this.props
    const { sidePanelOpen } = this.state

    console.log('repo cache...', repoCache)
    console.log('repo state...', repoState)

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
