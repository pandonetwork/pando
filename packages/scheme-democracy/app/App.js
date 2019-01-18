import React from 'react'
import { AragonApp, AppBar, AppView, NavigationBar } from '@aragon/ui'

import OverviewScreen from './screens/Overview'
import RFIView from './screens/RFI'

import TabBar from './components/TabBar'

const tabData = [
  {
    title: 'Conversation',
    screen: OverviewScreen,
    button: { label: 'Add Project', actions: ['sidePanelOpen'] },
    sidePanelContent: 'NewProject',
    sidePanelTitle: 'New Project',
  },
  {
    title: 'Lineage',
    screen: OverviewScreen,
    button: { label: 'New Issue', actions: ['createIssue'] },
  },
  { title: 'Code', screen: OverviewScreen },
]

export default class App extends React.Component {
  state = {
    navItems: ['Pando'],
    selectedTabIndex: 1,
    selectedRFIIndex: 0,
  }

  forward = (title, rfiIndex) => {
    this.setState(({ navItems }) => ({
      navItems: [...navItems, title],
      selectedRFIIndex: rfiIndex,
    }))
  }

  backward = () => {
    if (this.state.navItems.length <= 1) {
      return
    }
    this.setState(({ navItems }) => ({ navItems: navItems.slice(0, -1) }))
  }

  render() {
    const { navItems, selectedTabIndex, selectedRFIIndex } = this.state

    return (
      <AragonApp publicUrl="/">
        <AppView
          appBar={
            <AppBar>
              <NavigationBar items={navItems} onBack={this.backward} />
              {navItems.length > 1 && (
                <TabBar
                  data={tabData.map(({ title }) => title)}
                  selected={selectedTabIndex}
                  onSelect={idx => this.setState({ selectedTabIndex: idx })}
                />
              )}
            </AppBar>
          }
        >
          {navItems.length < 2 && (
            <OverviewScreen
              rfiVotes={this.props.rfiVotes}
              forward={this.forward}
            />
          )}
          {navItems.length > 1 && (
            <RFIView
              rfiVotes={this.props.rfiVotes}
              rflVotes={this.props.rflVotes}
              rfiIndex={selectedRFIIndex}
              app={this.props.app}
            />
          )}
        </AppView>
      </AragonApp>
    )
  }
}
