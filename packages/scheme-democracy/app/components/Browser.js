import IPFS from 'ipfs-http-client'
import React from 'react'
import styled from 'styled-components'
import IconFile from './IconFile'
import IconFolder from './IconFolder'
import Highlight, { defaultProps } from 'prism-react-renderer'

const Container = styled.div`
  margin-top: 0.5rem;
  border: 1px solid #d1d1d1;
  border-bottom: none;
  border-radius: 3px;
  background-color: white;
`

const Table = styled.table`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
`

const Row = styled.tr`
  &:hover {
    background-color: #f6fafe;
    cursor: pointer;
  }
`

const Column = styled.td`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #d1d1d1;
  font-size: 14px;
`

const Link = styled.a`
  &:hover {
    display: inline-block;
    text-decoration: underline;
  }
`

const LinkColor = styled.a`
  margin-right: 5px;
  color: #02cbe6;
  &:hover {
    cursor: pointer;
    display: inline-block;
    text-decoration: underline;
  }
`

const LinkSpan = styled.span`
  margin-right: 5px;
`

function Nav(props) {
  console.log(props)
  const entries = props.nav.map((entry, idx) =>
    idx !== props.nav.length - 1 ? (
      <LinkSpan key={idx}>
        <LinkColor
          title={entry}
          onClick={() => {
            props.goto(idx)
          }}
        >
          {entry.toString()}
        </LinkColor>
        /
      </LinkSpan>
    ) : (
      <LinkSpan key={idx}>{entry}</LinkSpan>
    )
  )

  return entries
}

function File(props) {
  return (
    <Highlight
      {...defaultProps}
      code={props.file}
      language="javascript"
      theme={undefined}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

function Entry(props) {
  const { entry, forward, display } = props
  if (entry.type === 'dir') {
    return (
      <Row
        onClick={async () => {
          forward(entry)
        }}
      >
        <Column>
          <IconFolder mr=".5rem" />
          <Link title={entry.name}>{entry.name}</Link>
        </Column>
      </Row>
    )
  } else if (entry.type === 'file') {
    return (
      <Row
        onClick={async () => {
          display(entry)
        }}
      >
        <Column>
          <IconFile mr=".5rem" />
          <Link title={name}>{entry.name}</Link>
        </Column>
      </Row>
    )
  }
}

function Folder(props) {
  const entries = props.tree.map(entry => (
    <Entry
      key={entry.name}
      entry={entry}
      forward={props.forward}
      display={props.display}
    />
  ))

  if (props.parents.length !== 0) {
    entries.unshift(
      <Row
        key=".."
        onClick={async () => {
          props.backward()
        }}
      >
        <Column>..</Column>
      </Row>
    )
  }

  return entries
}

export default class Browser extends React.Component {
  constructor(props) {
    super(props)
    this.ipfs = IPFS({ host: 'localhost', port: '5001', protocol: 'http' })
    this.forward = this.forward.bind(this)
    this.backward = this.backward.bind(this)
    this.display = this.display.bind(this)
    this.goto = this.goto.bind(this)
  }

  state = {
    file: null,
    tree: [],
    parents: [],
    nav: [],
  }

  componentWillMount() {
    this.ipfs.ls(this.props.tree).then(tree => {
      this.setState({ tree, nav: [this.props.name] })
    })
  }

  forward(entry) {
    const { tree, nav, parents } = this.state
    parents.push(tree)
    nav.push(entry.name)

    this.ipfs.ls(entry.hash).then(tree => {
      this.setState({ tree, nav, parents })
    })
  }

  backward() {
    const { nav, parents } = this.state
    const tree = parents.pop()
    nav.pop()
    this.setState({ tree, nav, parents })
  }

  display(entry) {
    const { nav, tree, parents } = this.state
    nav.push(entry.name)
    parents.push(tree)

    this.ipfs.cat(entry.hash).then(buffer => {
      const content = buffer.toString() ? buffer.toString() : 'Empty file'

      this.setState({ file: content, nav, tree, parents })
    })
  }

  goto(id) {
    const { nav, parents } = this.state

    const tree = parents[id]
    nav.splice(id + 1, nav.length)
    parents.splice(id, parents.length)

    this.setState({ tree, nav, parents, file: null })
  }

  render() {
    const { file, tree, nav, parents } = this.state

    const content = file ? (
      <File file={file} />
    ) : (
      <Container>
        <Table>
          <tbody>
            <Folder
              tree={tree}
              parents={parents}
              forward={this.forward}
              backward={this.backward}
              display={this.display}
            />
          </tbody>
        </Table>
      </Container>
    )

    return (
      <div>
        <Nav nav={nav} goto={this.goto} />
        {content}
      </div>
    )
  }
}
