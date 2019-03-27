import React from 'react'
import styled from 'styled-components'
import { Button, SidePanel, TextInput, Field } from '@aragon/ui'

export default class NewRepositorySidePanel extends React.Component {
  static defaultProps = {
    onClose: () => {},
    onSubmit: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {
      name: '',
      description: '',
    }
  }

  componentWillReceiveProps({ opened }) {
    if (opened && !this.props.opened) {
      // setTimeout is needed as a small hack to wait until the input's on
      // screen until we call focus
      this.nameInput && setTimeout(() => this.nameInput.focus(), 0)
    } else if (!opened && this.props.opened) {
      // Finished closing the panel, so reset its state
      this.setState({ name: '', description: '' })
    }
  }

  handleNameChange = event => {
    this.setState({ name: event.target.value })
  }

  handleDescriptionChange = event => {
    this.setState({ description: event.target.value })
  }

  handleSubmit = event => {
    event.preventDefault()
    this.props.onSubmit(this.state.name.trim(), this.state.description.trim())
  }

  render() {
    const { name, description } = this.state
    const { opened, onClose } = this.props

    return (
      <SidePanel title="New repository" opened={opened} onClose={onClose}>
        <Form onSubmit={this.handleSubmit}>
          <Field label="Name">
            <TextInput ref={name => (this.nameInput = name)} value={name} onChange={this.handleNameChange} required wide />
          </Field>
          <Field label="Description">
            <TextInput ref={description => (this.descriptionInput = description)} value={description} onChange={this.handleDescriptionChange} wide />
          </Field>
          <Button mode="strong" type="submit" wide>
            Create Repository
          </Button>
        </Form>
      </SidePanel>
    )
  }
}

const Form = styled.form`
  margin-top: 20px;
`
