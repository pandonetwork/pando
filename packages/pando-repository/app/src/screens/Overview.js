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
    const { branches } = this.props

    if (branches.length) {
      this.get(branches[0][1], 'tree').then(tree => {
        if (tree['README.md']) {
          this.get(tree['README.md'].hash['/']).then(buffer => {
            const content = buffer.toString()
            this.setState({ readme: content })
          })
        }
      })
    }
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
    const { name, description, branches } = this.props
    const { readme } = this.state

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
                <Text><Text weight="bold">3</Text> branches</Text>
              </TableCellCentered>
              <TableCellCentered>
                <Text><Text weight="bold">34</Text> commits</Text>
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
