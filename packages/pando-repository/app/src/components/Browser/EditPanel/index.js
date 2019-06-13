import { Button } from '@aragon/ui'
import 'codemirror/addon/display/autorefresh'
import 'codemirror/addon/selection/mark-selection'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/gfm/gfm'
import 'codemirror/mode/javascript/javascript'
import React from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import ReactMarkdown from 'react-markdown/with-html'
import styled from 'styled-components'

const Buttons = styled.div`
  margin-top: 2rem;
  button {
    float: right;
    margin-left: 1rem;
  }
`

const StyledForm = styled.form`
  .CodeMirror-cursor {
    margin-top: 11px;
  }
`

export default class EditPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      source: '',
    }
    this.renderFormPreview = this.renderFormPreview.bind(this)
  }

  componentWillReceiveProps(newProps) {
    const state = { source: newProps.source }
    this.setState(state)
  }

  renderFormPreview() {
    const { source } = this.state
    const { handleSubmit, handleStopEditing, setCodeMirrorInstance, screenIndex } = this.props

    if (screenIndex === 0) {
      return (
        <StyledForm onSubmit={e => e.preventDefault}>
          <CodeMirror
            value={source}
            options={{
              mode: 'gfm',
              theme: 'default',
              autofocus: true,
              lineWrapping: true,
              styleSelectedText: true,
              autoRefresh: true,
              cursorHeight: 0.5,
            }}
            selection={{ focus: true }}
            editorDidMount={editor => {
              setCodeMirrorInstance(editor)
            }}
            onBeforeChange={(editor, data, value) => {
              this.setState({ source: value })
            }}
            onChange={(editor, data, value) => {
              this.setState({ source: value })
              handleSubmit(value, false)
              editor.focus()
            }}
          />
          <Buttons>
            <Button mode="strong" emphasis="positive" onClick={e => handleSubmit(source, true)}>
              Save (commit changes)
            </Button>
            <Button mode="strong" emphasis="negative" onClick={e => handleStopEditing()}>
              Cancel
            </Button>
          </Buttons>
        </StyledForm>
      )
    } else if (screenIndex === 1) {
      return (
        <div>
          <ReactMarkdown source={source} escapeHtml={false} />
          <Buttons>
            <Button mode="strong" emphasis="positive" onClick={e => handleSubmit(source, true)}>
              Save (commit changes)
            </Button>
            <Button mode="strong" emphasis="negative" onClick={e => handleStopEditing()}>
              Cancel
            </Button>
          </Buttons>
        </div>
      )
    }
  }

  render() {
    return <div>{this.renderFormPreview()}</div>
  }
}
