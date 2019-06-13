import { Table, TableCell, TableRow, Text, theme } from '@aragon/ui'
import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
import React from 'react'
import styled from 'styled-components'
import Display from '../components/Browser/Display'

const EMPTY_REPO = `\u0000
  ## Your repository is empty

  Make a commit and \`git push\` to this pando repo!
`

const NO_README = `\u0000
  ## No README.md file found

  We couldn't find a README.md file in your master branch. Considering adding one to tell everyone what this repo is about!
`

export default class Overview extends React.Component {
  static defaultProps = {
    branches: [],
    name: 'Loading...',
    description: 'Loading...',
  }

  constructor(props) {
    super(props)
    this.ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
    this.ipld = new IPLD({
      blockService: this.ipfs.block,
      formats: [IPLDGit],
    })
    this.state = {
      readme: null,
    }
  }

  componentDidMount() {
    this.deriveReadmeFromBranches(this.props.branches, 0, 0)
  }

  componentWillReceiveProps(props) {
    this.deriveReadmeFromBranches(props.branches, 0, 0)
  }

  deriveCommitFromBranch(branches, branchId, commitId) {
    if (Object.keys(branches).length && branches[Object.keys(branches)[branchId]] && branches[Object.keys(branches)[branchId]][commitId]) {
      return branches[Object.keys(branches)[branchId]][commitId]
    } else {
      return undefined
    }
  }

  deriveReadmeFromBranches(branches) {
    const commit = this.deriveCommitFromBranch(branches, 0, 0)

    if (commit) {
      this.get(commit.cid, 'tree')
        .then(tree => {
          if (tree['README.md']) {
            this.get(commit.cid, 'tree/README.md/hash')
              .then(buffer => {
                const content = buffer.toString()
                this.setState({ readme: content })
              })
              .catch(err => {
                console.error('Failed to load README.md due to: ' + err)
              })
          }
        })
        .catch(err => {
          console.error('Failed to load README.md due to: ' + err)
        })
    }
  }

  async get(hash, path) {
    return new Promise((resolve, reject) => {
      const cid = CID.isCID(hash) ? hash : new CID(hash)

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
    const { name, description, branches } = this.props
    const { readme } = this.state

    const nbOfBranches = Object.keys(branches).length
    const nbOfCommits = branches[Object.keys(branches)[0]] ? branches[Object.keys(branches)[0]].length : 0

    return (
      <div>
        <InsideWrapper>
          <Text size="xlarge" weight="bold">
            {name}
          </Text>
          <br />
          <Text>{description}</Text>
        </InsideWrapper>

        {Object.keys(branches).length === 0 && <Display file={EMPTY_REPO} filename="README.md" />}

        {Object.keys(branches).length > 0 && (
          <InsideWrapper>
            <Table>
              <TableRow>
                <TableCellCentered>
                  <Text>
                    <Text weight="bold">{nbOfBranches}</Text> branches
                  </Text>
                </TableCellCentered>
                <TableCellCentered>
                  <Text>
                    <Text weight="bold">{nbOfCommits}</Text> commits
                  </Text>
                </TableCellCentered>
                <TableCellCentered>
                  <Text>
                    <Text weight="bold">X</Text> contributors <Text color={theme.textTertiary}> [coming soon]</Text>
                  </Text>
                </TableCellCentered>
              </TableRow>
            </Table>
          </InsideWrapper>
        )}

        {Object.keys(branches).length > 0 && readme && <Display file={readme} filename="README.md" />}

        {Object.keys(branches).length > 0 && !readme && <Display file={NO_README} filename="README.md" />}
      </div>
    )
  }
}

const InsideWrapper = styled.div`
  margin-bottom: 30px;
`

const TableCellCentered = styled(TableCell)`
  * {
    justify-content: center;
  }
`
