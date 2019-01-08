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
  IconHome,
  observe
} from '@aragon/ui'
import Aragon, { providers } from '@aragon/client'
import styled from 'styled-components'
import OrganismScreen from './screens/Organism'
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

const ItemContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(282px, 1fr));
  grid-gap: 2rem;
`

function WithdrawalsTable(props) {
  const withdrawals = props.withdrawals

  if(withdrawals.length === 0) { return('') }

  const items = withdrawals.map((withdrawal) => {
    return(
      <TableRow>
        <TableCell><Text color={theme.negative}>- {web3Utils.fromWei(withdrawal.value.toString(), 'ether')} ETH</Text></TableCell>
      </TableRow>
    )
  })

  return (
    <Table header={<TableRow><TableHeader title="Withdrawals" /></TableRow>}>{items}</Table>
  )
}

function OrganismsGrid(props) {
  const organisms = props.organisms
  const onActivate = props.onActivate


  const items = organisms.map((address, idx) => {
    return(
      <EmptyStateCard
        key={idx}
        icon={IconHome}
        title={address}
        actionText='View organism'
        onActivate={() => onActivate(address)}
      />
    )

  })

  return(<ItemContainer>{items}</ItemContainer>)
}

export default class App extends React.Component {

  static defaultProps = {
    account: '',
    organisms: []
  }

  state = {
    panelOpen: false,
    selectedScheme: 0,
    organismName: '',
    organismToken: '',
    organism: '',
    navItems: ["Colony", "OrganismX"],
  }

  forward = (address) => {
    this.setState(({ navItems }) => ({
      navItems: [...navItems, address],
      organism: address,
    }))
  }

  backward = () => {
    if (this.state.navItems.length <= 1) {
      return
    }
    this.setState(({ navItems }) => ({ navItems: navItems.slice(0, -1) }))
  }

  render () {
    const organisms = ['0xorganism1', '0xorganism2']

    const {
      organism,
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
          navItems.length < 2 && !organisms.length && (
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
        {navItems.length < 2 && !!organisms.length && (
            <OrganismsGrid organisms={organisms} onActivate={this.forward} />
          )}
          {navItems.length > 1 && (
              <OrganismScreen name={organism.address} />
            )}
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
