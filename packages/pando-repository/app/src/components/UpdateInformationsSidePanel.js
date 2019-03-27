import React from 'react'
import styled from 'styled-components'
import { Button, SidePanel, TextInput, Field } from '@aragon/ui'

export default class UpdateInformationsSidePanel extends React.Component {
  static defaultProps = {
    name: '',
    description: '',
    onClose: () => {},
    onSubmit: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {
      name: props.name,
      description: props.description,
    }
  }

  // check how the name input works in the vote panel
  componentWillReceiveProps({ opened, name, description }) {
    this.setState({ name: name, description: description })
    if (opened && !this.props.opened) {
      // setTimeout is needed as a small hack to wait until the input's on
      // screen until we call focus
      this.nameInput && setTimeout(() => this.nameInput.focus(), 0)
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
      <SidePanel title="Update informations" opened={opened} onClose={onClose}>
        <Form onSubmit={this.handleSubmit}>
          <Field label="Name">
            <TextInput ref={name => (this.nameInput = name)} value={name} onChange={this.handleNameChange} required wide />
          </Field>
          <Field label="Description">
            <TextInput ref={description => (this.descriptionInput = description)} value={description} onChange={this.handleDescriptionChange} wide />
          </Field>
          <Button mode="strong" type="submit" wide>
            Update Informations
          </Button>
        </Form>
      </SidePanel>
    )
  }
}

const Form = styled.form`
  margin-top: 20px;
`
