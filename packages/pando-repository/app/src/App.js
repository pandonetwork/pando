import { AppView, Main, observe, TabBar } from '@aragon/ui'
import React from 'react'
import Code from './screens/Code'
import Overview from './screens/Overview'
import Requests from './screens/Requests'

const repository = {
  name: 'aragonAPI',
  address: '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7',
  description: 'JS library to interact with Aragon DAOs',
  branches: [
    ['master', 'z8mWaJHXieAVxxLagBpdaNWFEBKVWmMiE'],
    ['dev', 'z8mWaFhhBAZv6LEcYTHBfiUtAC7cGNgnt'],
  ],
}

const tabs = ['Overview', 'Code', 'Pull requests', 'Lineage requests']

class App extends React.Component {
  static defaultProps = {
    branches: [],
  }

  constructor(props) {
    super(props)

    this.state = { tabIndex: 0 }
  }

  render() {
    const { branches } = this.props
    const { tabIndex } = this.state
    const currentTab = tabs[tabIndex]

    return (
      <div css="min-width: 320px">
        <Main>
          <AppView
            title={repository.name}
            tabs={
              <TabBar
                items={branches.length > 0 ? tabs : [tabs[0]]}
                selected={tabIndex}
                onChange={tabIndex => this.setState({ tabIndex })}
              />
            }
          >
            {currentTab === 'Overview' && (
              <Overview repo={repository} branches={branches} />
            )}
            {currentTab === 'Code' && (
              <Code repo={repository} branches={branches} />
            )}
            {(currentTab === 'Pull requests' ||
              currentTab === 'Lineage requests') && <Requests />}
          </AppView>
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
