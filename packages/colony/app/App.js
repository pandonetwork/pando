import React from 'react'
import {
  AragonApp,
  Button,
  Text,
  PublicUrl,
  BaseStyles,
  AppView,
  AppBar,
  NavigationBar,
  EmptyStateCard,
  observe
} from '@aragon/ui'
import Aragon, { providers } from '@aragon/client'
import styled from 'styled-components'

const AppContainer = styled(AragonApp)`
  display: flex;
  align-items: center;
  justify-content: center;
`

import emptyIcon from './assets/empty-card.svg'

const EmptyIcon = <img src={emptyIcon} alt="" />

const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
`

export default class App extends React.Component {

  state = {
    panelOpen: false,
    selectedScheme: 0,
    organismName: '',
    organismToken: '',
    organisms: [],
    navItems: ["Colony", "OrganismX"],
  }

  backward = () => {
    if (this.state.navItems.length <= 1) {
      return
    }
    this.setState(({ navItems }) => ({ navItems: navItems.slice(0, -1) }))
  }

  render () {
    const {
      organisms,
      organismName,
      organismToken,
      selectedScheme,
      panelOpen,
      navItems,
      selectedOrganism,
    } = this.state

    return (
      <PublicUrl.Provider url="./aragon-ui/">
        <BaseStyles />
        <Main>
        <AppView
        appBar={
          <AppBar
            endContent={
              navItems.length < 2 && (
                <Button mode="strong" onClick={this.toggleSidebar}>New organism</Button>
              )
            }
          >
            <NavigationBar items={navItems} onBack={this.backward} />
          </AppBar>
        }>
        {
          navItems.length < 2 && !this.state.organisms.length && (
            <EmptyContainer>
              <EmptyStateCard
                icon={EmptyIcon}
                title="Deploy an organism"
                text="Get started now by deploying a new organism"
                actionText="New organism"
                onActivate={this.toggleSidebar}
              />
            </EmptyContainer>
          )
        }
        </AppView>

        </Main>
      </PublicUrl.Provider>

    )
  }
}

const Main = styled.div`
  height: 100vh;
`

const ObservedCount = observe(
  (state$) => state$,
  { count: 0 }
)(
  ({ count }) => <Text.Block style={{ textAlign: 'center' }} size='xxlarge'>{count}</Text.Block>
)
