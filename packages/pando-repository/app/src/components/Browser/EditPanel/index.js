import React from 'react'
import { Button } from '@aragon/ui'
import styled from 'styled-components'

const Textarea = styled.textarea`
  width: 100%;
  min-height: 10rem;
`
const Buttons = styled.div`
  margin-top: 8px;
  button {
    float: right;
    margin-left: 5px;
  }
`

export default class EditPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = { ...props }
  }

  componentWillReceiveProps(newProps) {
    const state = { ...newProps }
    this.setState(state)
  }

  render() {
    const { source } = this.state
    const { handleSubmit, mode } = this.props
    return (
      <div>
        <form onSubmit={e => e.preventDefault}>
          <Textarea value={source} onChange={e => this.setState({ source: e.target.value })} autoFocus={mode} />
          <Buttons>
            <Button mode="strong" emphasis="positive" onClick={e => handleSubmit(source)}>
              Save (commit changes)
            </Button>
            <Button mode="strong" emphasis="negative" onClick={e => handleSubmit(false)}>
              Cancel
            </Button>
          </Buttons>
        </form>
      </div>
    )
  }
}
