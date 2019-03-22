import { EmptyStateCard, Table, TableHeader, TableRow, TableCell, Text, theme } from '@aragon/ui'
import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
import React from 'react'
import styled from 'styled-components'
import Box from '../components/Box'
import Display from '../components/Browser/Display'

export default class Overview extends React.Component {
  static defaultProps = {
    branches: [],
    name: 'Loading...',
    description: 'Loading...'
  }

  constructor(props) {
    super(props)
    this.ipfs = IPFS({ host: 'localhost', port: '5001', protocol: 'http' })
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


    // if (branches.length) {
    //   this.get(branches[Object.keys(branches)[0]][0], 'tree').then(tree => {
    //     if (tree['README.md']) {
    //       this.get(tree['README.md'].hash['/']).then(buffer => {
    //         const content = buffer.toString()
    //         this.setState({ readme: content })
    //       })
    //     }
    //   })
    // }
  }

  componentWillReceiveProps(props) {
    console.log('RECEVING PROPS')
    console.log(props)

    this.deriveReadmeFromBranches(props.branches, 0, 0)
    // if (Object.keys(props.branches).length && props.branches[Object.keys(props.branches)[this.state.activeBranch]][0]) {
    //   const commit = props.branches[Object.keys(props.branches)[this.state.activeBranch]][0]
    //   console.log('commit')
    //   console.log(commit)
    //   this.get(commit.cid, 'tree').then(tree => {
    //     this.setState({ commit, tree, nav: [props.name] })
    //     console.log('STATE FROM PROPS FROM CONSTRUCTOR')
    //     console.log(state)
    //   })
    // }
  }

  deriveCommitFromBranch(branches, branchId, commitId) {
    if (Object.keys(branches).length && branches[Object.keys(branches)[branchId]] && branches[Object.keys(branches)[branchId]][commitId]) {
      return branches[Object.keys(branches)[branchId]][commitId]
    } else {
      return undefined
    }
  }

  deriveReadmeFromBranches(branches) {
    console.log('DERIVE README FROM BRANCHES')
    const commit = this.deriveCommitFromBranch(branches, 0, 0)

    console.log('COMMIT')
    console.log(commit)
    if (commit) {
      this.get(commit.cid, 'tree').then(tree => {
        if (tree['README.md']) {
          console.log('DO HAVE A README')
          this.get(commit.cid, 'tree/README.md/hash').then(buffer => {
            const content = buffer.toString()
            console.log('GOT README')
            console.log(content)
            this.setState({ readme: content })
          })
        } else {
          console.log('WE DONT HAVE A README')
        }
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

    if (branches.length === 0) {
      return (
        <Box
          display="flex"
          height="80vh"
          justifyContent="center"
          alignItems="center"
        >
          <EmptyStateCard
            title="Repository is empty"
            text="Make an initial commit to the repository to get started."
          />
        </Box>
      )
    }

    return (
      <div>
        <InsideWrapper>
          <Text size="xlarge" weight="bold">{name}</Text><br/>
          <Text>{description}</Text>
        </InsideWrapper>

        <InsideWrapper>

          <Table>
            <TableRow>
              <TableCellCentered>
                <Text><Text weight="bold">{nbOfBranches}</Text> branches</Text>
              </TableCellCentered>
              <TableCellCentered>
                <Text><Text weight="bold">{nbOfCommits}</Text> commits</Text>
              </TableCellCentered>
              <TableCellCentered>
                <Text><Text weight="bold">X</Text> contributors <Text color={theme.textTertiary}> [coming soon]</Text></Text>
              </TableCellCentered>
            </TableRow>
          </Table>
        </InsideWrapper>

        {readme && <Display file={readme} filename="README.md" />}
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
