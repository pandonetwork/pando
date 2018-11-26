import React from 'react'
import {
  AragonApp,
  Button,
  Card,
  Text,
  TextInput,
  RadioList,
  Field,
  AppBar,
  AppView,
  SidePanel,
  observe
} from '@aragon/ui'
import Aragon, { providers } from '@aragon/client'
import styled from 'styled-components'

const AppContainer = styled(AragonApp)`
  display: flex;
  align-items: center;
  justify-content: center;
`

const items = [
  {
    title: 'Dictator',
    description: 'Maintainers-based governance à-la GitHub',
    value: 'a',
  },
  {
    title: 'Democracy',
    description: 'Lineage-based voting, DAO-style',
    value: 'b',
  },
]


export default class App extends React.Component {
  state = {
    panelOpen: false
  }

  openSidebar = () => {
    this.setState({
      panelOpen: true
    })
  };

  render () {
    return (
      <AragonApp>
        <AppView appBar={ <AppBar title="Pando's Colony"  endContent={<Button mode="strong" onClick={this.openSidebar} >Deploy organism</Button>}/> }>
          <Card>
            <Text.Block style={{ textAlign: 'center' }}>@aragonUI</Text.Block>
          </Card>
          <SidePanel title="Menu" opened={this.state.panelOpen}>
            <Text size="xlarge">Deploy organism</Text>
            <Field label="Name:">
              <TextInput wide />
            </Field>
            <Field label="Token:">
              <TextInput wide />
            </Field>
            <RadioList
              title="Governance scheme"
              description="You have two options:"
              items={items}
            />
          </SidePanel>
        </AppView>
      </AragonApp>
    )
  }
}

const ObservedCount = observe(
  (state$) => state$,
  { count: 0 }
)(
  ({ count }) => <Text.Block style={{ textAlign: 'center' }} size='xxlarge'>{count}</Text.Block>
)
