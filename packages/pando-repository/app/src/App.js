import { AppView, Main, observe, TabBar } from '@aragon/ui'
import { map } from 'rxjs/operators'

import React from 'react'
import UpdateInformationsSidePanel from './components/UpdateInformationsSidePanel'
import Code from './screens/Code'
import Overview from './screens/Overview'
import Requests from './screens/Requests'
import Settings from './screens/Settings'

const tabs = ['Overview', 'Code', 'Pull requests', 'Lineage requests', 'Settings']

class App extends React.Component {
  static defaultProps = {
    branches: [],
    name: 'Loading...',
    description: 'Loading...',
  }

  constructor(props) {
    super(props)

    this.handleUpdateInformationsSidePanelOpen = this.handleUpdateInformationsSidePanelOpen.bind(this)
    this.handleUpdateInformationsSidePanelClose = this.handleUpdateInformationsSidePanelClose.bind(this)
    this.handleUpdateInformations = this.handleUpdateInformations.bind(this)

    this.state = {
      tabIndex: 0,
      updateInformationsSidePanelOpen: false,
    }
  }

  handleUpdateInformationsSidePanelOpen() {
    this.setState({ updateInformationsSidePanelOpen: true })
  }

  handleUpdateInformationsSidePanelClose() {
    this.setState({ updateInformationsSidePanelOpen: false })
  }

  handleUpdateInformations(name, description) {
    this.props.app.updateInformations(name, description)
  }

  render() {
    let { branches, PRs, name, description } = this.props
    const { tabIndex, updateInformationsSidePanelOpen } = this.state
    const currentTab = tabs[tabIndex]

    return (
      <div css="min-width: 320px">
        <Main>
          <AppView title={name} tabs={<TabBar items={tabs} selected={tabIndex} onChange={tabIndex => this.setState({ tabIndex })} />}>
            {currentTab === 'Overview' && <Overview name={name} description={description} branches={branches} />}
            {currentTab === 'Code' && <Code name={name} branches={branches} />}
            {(currentTab === 'Pull requests' || currentTab === 'Lineage requests') && <Requests PRs={PRs} />}
            {currentTab === 'Settings' && (
              <Settings name={name} description={description} handleUpdateInformationsSidePanelOpen={this.handleUpdateInformationsSidePanelOpen} />
            )}
          </AppView>

          <UpdateInformationsSidePanel
            name={name}
            description={description}
            opened={updateInformationsSidePanelOpen}
            onClose={this.handleUpdateInformationsSidePanelClose}
            onSubmit={this.handleUpdateInformations}
          />
        </Main>
      </div>
    )
  }
}

export default observe(
  observable =>
    observable.pipe(
      map(state => {
        return { ...state }
      })
    ),
  {}
)(App)
