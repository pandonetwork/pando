import { DropDown } from '@aragon/ui'
import React from 'react'
import styled from 'styled-components'
import Display from './Display'
import Nav from './Nav'
import Tree from './Tree'
import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'


export default class Browser extends React.Component {
  constructor(props) {
    super(props)
    this.ipfs = IPFS({ host: 'localhost', port: '5001', protocol: 'http' })
    this.ipld = new IPLD({
      blockService: this.ipfs.block,
      formats: [IPLDGit]
    })
    this.forward = this.forward.bind(this)
    this.backward = this.backward.bind(this)
    this.goto = this.goto.bind(this)
    this.display = this.display.bind(this)
    this.handleChangeActiveBranch = this.handleChangeActiveBranch.bind(this)
    this.state = {
      activeBranch: 0,
      file: null,
      tree: undefined,
      parents: [],
      nav: [],
    }
  }

  componentDidMount() {
    this
      .get(this.props.branches[0][1], 'tree')
      .then(tree => {
        this.setState({ tree, nav: [this.props.name] })
      })
  }

  forward(name, cid) {
    const { tree, nav, parents } = this.state
    parents.push(tree)
    nav.push(name)

    this.get(cid).then(tree => {
      this.setState({ tree, nav, parents })
    })
  }

  backward() {
    const { nav, parents } = this.state
    const tree = parents.pop()
    nav.pop()
    this.setState({ tree, nav, parents })
  }

  display(name, hash) {
    const { nav, tree, parents } = this.state
    nav.push(name)
    parents.push(tree)

    this
      .get(hash)
      .then(buffer => {
        const content = buffer.toString()
        const file = content ? content : 'Empty file'
        this.setState({ file, nav, tree, parents })
      })
  }

  goto(id) {
    const { nav, parents } = this.state
    const tree = parents[id]

    nav.splice(id + 1, nav.length)
    parents.splice(id, parents.length)

    this.setState({ tree, nav, parents, file: null })
  }

  handleChangeActiveBranch(id) {
    this
      .get(this.props.branches[id][1], 'tree')
      .then(tree => {
        this.setState({ activeBranch: id, tree, nav: [this.props.name], parents: [], file: null })
      })
  }

  async get(hash, path) {
    return new Promise((resolve, reject) => {
      this.ipld.get(new CID(hash), path, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result.value)
        }
      })
    })
  }

  render() {
    const { branches } = this.props
    const { activeBranch, nav, parents, file, tree } = this.state

    return (
      <Wrapper>
        <DropDown items={branches.map(branch => branch[0])} active={activeBranch} onChange={this.handleChangeActiveBranch}/>
        <Nav nav={nav} goto={this.goto} />
        {file && (
            <Display file={file} />
        )}
        {!file && tree && (
          <Tree tree={tree} parents={parents} forward={this.forward} backward={this.backward} display={this.display} />
        )}
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  margin: 0 auto;
  width: 980px;
`
