import { Button } from '@aragon/ui'
import Prism from 'prismjs'
import 'prismjs/components/prism-actionscript'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-coffeescript'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-css-extras'
import 'prismjs/components/prism-diff'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-elixir'
import 'prismjs/components/prism-erlang'
import 'prismjs/components/prism-git'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-graphql'
import 'prismjs/components/prism-handlebars'
import 'prismjs/components/prism-haskell'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-latex'
import 'prismjs/components/prism-makefile'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-markup-templating'
import 'prismjs/components/prism-objectivec'
import 'prismjs/components/prism-ocaml'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-reason'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-sass'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-swift'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-vim'
import 'prismjs/components/prism-yaml'
import React from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import styled from 'styled-components'
import xss from 'xss'
import { prismMapping } from '../constants'
import EditorTabBar from '../EditorTabBar'
import EditPanel from '../EditPanel/'
import { ipfs } from '@pando/lib'

export const MarkdownWrapper = styled.div`
  margin-top: 2rem;

  h1 {
    font-size: 2em;
    font-weight: 600;
    border-bottom: 1px solid #eaecef;
    margin: 2rem 0;
  }
  h2 {
    font-size: 1.5em;
    font-weight: 600;
    border-bottom: 1px solid #eaecef;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  blockquote {
    border-left: 1px solid #eaecef;
    font-style: italic;
    margin: auto;
    padding-left: 5px;
  }
  p {
    margin-bottom: 1rem;
  }
  a {
    color: #0366d6;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  a > code,
  p > code {
    background-color: rgba(27, 31, 35, 0.05);
    border-radius: 3px;
    padding: 0.2em 0.4em;
  }
  table {
    border-collapse: collapse;
  }

  tr {
    border-top: 1px solid #c6cbd1;
  }
  tr:nth-child(2n) {
    background-color: #f6f8fa;
  }
  th,
  td {
    border: 1px solid #dfe2e5;
    padding: 6px 13px;
  }
  pre {
    margin: 0;
    background-color: #f6f8fa;
    border-radius: 3px;
    overflow: auto;
    padding: 16px;
  }
`
const normalizeFile = file => {
  const splittedFile = file.split('\u0000')
  let normalizedFile = file
  if (splittedFile.length > 1) {
    normalizedFile = file.split('\u0000')[1] // TODO: find a better way to get rid of "blob 2610\u0000"
  }

  return normalizedFile
}

export default class Display extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false,
      source: '',
      newSourceFileHash: null,
      screenIndex: 0,
      codeMirrorInstance: null,
    }

    this.handleEditingEnabled = this.handleEditingEnabled.bind(this)
    this.handleEditingDisabled = this.handleEditingDisabled.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleScreenChange = this.handleScreenChange.bind(this)
    this.setCodeMirrorInstance = this.setCodeMirrorInstance.bind(this)
  }

  handleEditingEnabled() {
    this.handleScreenChange(0)
    this.setState({ editing: true })
  }

  handleScreenChange(_screenIndex) {
    this.setState({ screenIndex: _screenIndex })
  }

  handleEditingDisabled() {
    // Rerender the latest file on ipfs

    const { file } = this.props
    const normalizedFile = normalizeFile(file)
    this.setState({ editing: false, source: normalizedFile })
  }

  async handleSubmit(value, upload) {
    if (value) {
      let sanitizedHtml = xss(value)
      this.setState({ source: sanitizedHtml })
    }

    if (upload) {
      let ipfsId
      let newFile = new File([value], this.props.filename)
      ipfs
        .add([newFile])
        .then(response => {
          console.log(response)
          ipfsId = response[0].hash
          console.log(ipfsId)
          this.setState({ newSourceFileHash: ipfsId })
        })
        .catch(err => {
          console.error(err)
        })

      this.setState({ editing: false })
    }
  }

  setCodeMirrorInstance(instance) {
    this.setState({ codeMirrorInstance: instance })
  }

  render() {
    const { file, filename, removeBorder, plain, codeView } = this.props
    const { editing, source, screenIndex, codeMirrorInstance } = this.state

    let normalizedFile = normalizeFile(file)
    const language = prismMapping[filename.split('.').pop()]

    normalizedFile = source === '' ? normalizedFile : source

    return (
      <Wrapper removeBorder={removeBorder}>
        {codeView && !editing && (
          <Button onClick={this.handleEditingEnabled} mode="strong" style={{ float: 'right', maxWidth: '8rem' }} wide>
            Edit file
          </Button>
        )}
        {!plain && language === 'markdown' && !editing && (
          <MarkdownWrapper>
            <ReactMarkdown source={normalizedFile} escapeHtml={false} />
          </MarkdownWrapper>
        )}
        {(plain || language !== 'markdown') && !editing && (
          <pre
            dangerouslySetInnerHTML={{
              __html: Prism.highlight(normalizedFile, filename.split('.').length > 1 ? Prism.languages[language] : ''),
            }}
          />
        )}
        {language === 'markdown' && editing && (
          <div>
            <EditorTabBar
              handleScreenChange={this.handleScreenChange}
              screenIndex={screenIndex}
              handleSelectionSize={() => {
                codeMirrorInstance.doc.replaceSelection('#' + codeMirrorInstance.doc.getSelection())
              }}
              handleSelectionUnorderedList={() => {
                codeMirrorInstance.doc.replaceSelection('\n* ' + codeMirrorInstance.doc.getSelection() + '\n')
              }}
              handleSelectionBold={() => {
                codeMirrorInstance.doc.replaceSelection('**' + codeMirrorInstance.doc.getSelection() + '**')
              }}
              handleSelectionItalic={() => {
                codeMirrorInstance.doc.replaceSelection('*' + codeMirrorInstance.doc.getSelection() + '*')
              }}
              handleSelectionLink={() => {
                codeMirrorInstance.doc.replaceSelection('[' + codeMirrorInstance.doc.getSelection() + ']()')
              }}
              handleSelectionCode={() => {
                codeMirrorInstance.doc.replaceSelection('`' + codeMirrorInstance.doc.getSelection() + '`')
              }}
              handleSelectionQuote={() => {
                codeMirrorInstance.doc.replaceSelection('\n> > ' + codeMirrorInstance.doc.getSelection())
              }}
            />
            <MarkdownWrapper>
              <EditPanel
                source={normalizedFile}
                handleSubmit={this.handleSubmit}
                setCodeMirrorInstance={this.setCodeMirrorInstance}
                screenIndex={screenIndex}
                handleStopEditing={this.handleEditingDisabled}
              />
            </MarkdownWrapper>
          </div>
        )}
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Overpass+Mono:300');

  margin-top: 0.5rem;
  padding: 2rem;
  border: ${({ removeBorder }) => (removeBorder ? '' : '1px solid #e6e6e6')};
  border-radius: 3px;
  background-color: white;
  overflow-x: scroll;

  pre {
    font-family: 'Overpass Mono';
    font-size: 0.9em;
    margin: 0;
  }
  .punctuation {
    color: #24292e;
  }
  .keyword,
  .url,
  .number {
    color: #d73a49;
  }
  .string,
  .attr-value {
    color: #032f62;
  }
  .function,
  .attr-name,
  .property {
    color: #6f42c1;
  }
  .function-variable {
    color: #005cc5;
  }
  .comment {
    color: #6a737d;
  }
  .doctype,
  .tag,
  .title,
  .selector {
    color: #22863a;
  }
`
