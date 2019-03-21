import { AppView, Main, observe, TabBar } from '@aragon/ui'
import React from 'react'
import UpdateInformationsSidePanel from './components/UpdateInformationsSidePanel'
import Code from './screens/Code'
import Overview from './screens/Overview'
import Requests from './screens/Requests'
import Settings from './screens/Settings'


const repository = {
  name: 'aragonAPI',
  address: '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7',
  description: 'JS library to interact with Aragon DAOs',
  branches: [
    ['master', 'z8mWaJHXieAVxxLagBpdaNWFEBKVWmMiE'],
    ['dev', 'z8mWaFhhBAZv6LEcYTHBfiUtAC7cGNgnt'],
  ],
}

const tabs = ['Overview', 'Code', 'Pull requests', 'Lineage requests', 'Settings']

class App extends React.Component {
  static defaultProps = {
    branches: [],
    name: 'Loading ...',
    description: ''
  }

  constructor(props) {
    super(props)

    this.handleUpdateInformationsSidePanelOpen = this.handleUpdateInformationsSidePanelOpen.bind(this);

    this.state = {
      tabIndex: 0,
      updateInformationsSidePanelOpen: false
    }
  }

  handleUpdateInformationsSidePanelOpen = () => {
    this.setState({ updateInformationsSidePanelOpen: true })
  }

  handleUpdateInformationsSidePanelClose = () => {
    this.setState({ updateInformationsSidePanelOpen: false })
  }

  handleUpdateInformations = (name, description) => {
    // console.log(name)
    // console.log(description)
    this.props.app.updateInformations(name, description)
  }

  render() {
    let { branches, name, description } = this.props
    console.log(this.props)
    // const { name, description } = { name: 'aragonOS', description: 'A solidity framework to develop DAOs' }
    const { tabIndex, updateInformationsSidePanelOpen } = this.state

    console.log(updateInformationsSidePanelOpen)

    const currentTab = tabs[tabIndex]

    //branches = [['master', 'z8mWaG3rh3fyrnWuRAKLN3YwmESb2GoyZ']]

    return (
      <div css="min-width: 320px">
        <Main>
          <AppView
            title={name}
            tabs={
              <TabBar
                items={tabs}
                selected={tabIndex}
                onChange={tabIndex => this.setState({ tabIndex })}
              />
            }
          >
            {currentTab === 'Overview' && (
              <Overview repo={repository} branches={branches} />
            )}
            {currentTab === 'Code' && (
              <Code name={name} branches={branches} />
            )}
            {(currentTab === 'Pull requests' ||
              currentTab === 'Lineage requests') && <Requests />}
            {currentTab === 'Settings' && <Settings name={name} description={description} handleUpdateInformationsSidePanelOpen={this.handleUpdateInformationsSidePanelOpen}/>}
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
    observable.map(state => {
      const { branches } = state
      console.log('Branches from observable: ')
      console.log(branches)

      return {
        ...state,
        branches:
          Object.keys(branches).length > 0
            ? Object.keys(branches).map(key => {
                return [key, branches[key]]
              })
            : [],
      }
    }),
  {}
)(App)
