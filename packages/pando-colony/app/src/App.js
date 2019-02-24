import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { EmptyStateCard, Main, SidePanel, observe, theme } from '@aragon/ui'
import AppLayout from './components/AppLayout'
import NewRepositoryIcon from './components/NewRepositoryIcon'
import NewRepositorySidePanel from './components/NewRepositorySidePanel'
import EmptyState from './screens/EmptyState'
import Repositories from './screens/Repositories'
import repositories from './data'


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

  handleCreateRepository= (name, description) => {
    this.props.app.createRepository(name, description)
  }

  render() {
    // const { repositories } = this.props
    const { sidePanelOpen } = this.state

      console.log(repositories)

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
            {repositories.length > 0 ? (
              <Repositories repositories={repositories} />
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
