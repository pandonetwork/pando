import { DropDown, Text, theme } from '@aragon/ui'
import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
import React from 'react'
import styled from 'styled-components'
import Display from './Display'
import Nav from './Nav'
import Tree from './Tree'

export default class Browser extends React.Component {
  constructor(props) {
    super(props)

    this.ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
    this.ipld = new IPLD({
      blockService: this.ipfs.block,
      formats: [IPLDGit],
    })

    this.forward = this.forward.bind(this)
    this.backward = this.backward.bind(this)
    this.goto = this.goto.bind(this)
    this.display = this.display.bind(this)
    this.handleChangeActiveBranch = this.handleChangeActiveBranch.bind(this)
    this.handleChangeActiveCommit = this.handleChangeActiveCommit.bind(this)

    this.state = {
      activeBranch: 0,
      activeCommit: 0,
      commit: null,
      file: null,
      filename: null,
      tree: undefined,
      parents: [],
      nav: [props.name],
    }
  }

  componentDidMount() {
    this.deriveCommitAndTreeFromBranch(this.props.branches, 0, 0)
  }

  componentWillReceiveProps(props) {
    this.deriveCommitAndTreeFromBranch(props.branches, 0, 0)
  }

  deriveCommitFromBranch(branches, branchId, commitId) {
    if (Object.keys(branches).length && branches[Object.keys(branches)[branchId]] && branches[Object.keys(branches)[branchId]][commitId]) {
      const commit = branches[Object.keys(branches)[branchId]][commitId]
      this.setState({ commit })
      return commit
    } else {
      return undefined
    }
  }

  deriveTreeFromCommit(commit) {
    try {
      this.get(commit.cid, 'tree').then(tree => {
        this.setState({ tree })
      })
    } catch (err) {
      console.error('Failed to load tree from commit due to:', err)
    }
  }

  deriveCommitAndTreeFromBranch(branches, branchId, commitId) {
    const commit = this.deriveCommitFromBranch(branches, branchId, commitId)
    if (commit) this.deriveTreeFromCommit(commit)
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

    this.get(hash).then(buffer => {
      const content = buffer.toString()
      const file = content || 'Empty file'
      this.setState({ file, filename: name, nav, tree, parents })
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
    this.setState({ activeBranch: id, nav: [this.props.name], parents: [], file: null })
    this.deriveCommitAndTreeFromBranch(this.props.branches, id, 0)
  }

  handleChangeActiveCommit(id) {
    this.setState({ activeCommit: id, nav: [this.props.name], parents: [], file: null })
    this.deriveCommitAndTreeFromBranch(this.props.branches, this.state.activeBranch, id)
  }

  async get(hash, path) {
    const cid = CID.isCID(hash) ? hash : new CID(hash)

    return new Promise((resolve, reject) => {
      this.ipld.get(cid, path, (err, result) => {
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
    const { activeBranch, activeCommit, nav, parents, file, filename, commit, tree } = this.state

    return (
      <Wrapper>
        <Header>
          <div>
            <DropDown items={Object.keys(branches)} active={activeBranch} onChange={this.handleChangeActiveBranch} />

            <Nav nav={nav} goto={this.goto} />
          </div>
          <div>
            {commit && <Message color={theme.textSecondary}>{commit.message}</Message>}
            <DropDown
              items={branches[Object.keys(branches)[activeBranch]].map(commit => commit.sha.substring(0, 7))}
              active={activeCommit}
              onChange={this.handleChangeActiveCommit}
            />
          </div>
        </Header>
        {file && <Display file={file} filename={filename} codeView />}
        {!file && tree && <Tree tree={tree} parents={parents} forward={this.forward} backward={this.backward} display={this.display} />}
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  padding: 1rem;
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const Message = styled(Text)`
  margin-right: 15px;
`
