import React from 'react'
import { Button } from '@aragon/ui'
import styled from 'styled-components'
import ReactMarkdown from 'react-markdown/with-html'
import { Controlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/gfm/gfm'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/mark-selection'
import 'codemirror/addon/display/autorefresh'

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
    this.renderFormPreview = this.renderFormPreview.bind(this)
  }

  componentWillReceiveProps(newProps) {
    const state = { ...newProps }
    this.setState(state)
  }

  renderFormPreview() {
    const { source } = this.state
    const { handleSubmit, handleStopEditing, setCodeMirrorInstance, screenIndex } = this.props

    if (screenIndex === 0) {
      return (
        <form onSubmit={e => e.preventDefault}>
          <CodeMirror
            value={source}
            options={{
              mode: 'gfm',
              theme: 'default',
              autofocus: true,
              lineWrapping: true,
              styleSelectedText: true,
              autoRefresh: true
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
              editor.focus()
            }}
          />
          <Buttons>
            <Button mode="strong" onClick={e => handleSubmit(source, false)}>
              Update preview
            </Button>
            <Button mode="strong" emphasis="negative" onClick={e => handleStopEditing()}>
              Cancel
            </Button>
          </Buttons>
        </form>
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
