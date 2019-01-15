import React from 'react'
import styled from 'styled-components'
import {
  Text,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  IconCheck,
  IconCross,
} from '@aragon/ui'

import Box from '../components/Box'

const MainContainer = styled.div`
  margin-top: 3rem;
`

const Button = styled.div`
  height: 100%;
  margin-right: 1rem;
  padding: 0.25rem 1rem;
  border: 1px solid rgb(230, 230, 230);
  border-radius: 3px;
  &:hover {
    cursor: pointer;
    background-color: #f7fbfd;
  }
`

const Field = styled.input.attrs({
  type: 'text',
})`
  padding: 0.25rem 0.75rem;
  height: 2.5rem;
  background: #ffffff;
  border: 1px solid rgba(209, 209, 209, 0.75);
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.03);
  border-radius: 3px;
`

const StyledTableCell = styled(TableCell)`
  & > div {
    justify-content: flex-start;
  }
`

export default class App extends React.Component {
  render() {
    const { rfiVotes, rfiIndex, rflVotes } = this.props
    const currentRFI = rfiVotes[rfiIndex]
    return (
      <MainContainer>
        <Box>
          <Box mb="0.5rem">
            <Text weight="bold">RFI</Text>
          </Box>
          <Table
            header={
              <TableRow>
                <TableHeader title="Message" />
                <TableHeader title="Organism" />
                <TableHeader title="Actions" />
              </TableRow>
            }
          >
            <TableRow>
              <TableCell>Update README.md</TableCell>
              <TableCell>{currentRFI.organism}</TableCell>
              <StyledTableCell>
                <Button>
                  <IconCheck /> Accept
                </Button>
                <Button>
                  <IconCross /> Reject
                </Button>
              </StyledTableCell>
            </TableRow>
          </Table>
        </Box>
        <Box mt="4rem">
          <Box mb="0.5rem">
            <Text weight="bold">Related RFLs</Text>
          </Box>
          <Table
            header={
              <TableRow>
                <TableHeader title="Receiver" />
                <TableHeader title="For" />
                <TableHeader title="Minimum" />
                <TableHeader title="Actions" />
              </TableRow>
            }
          >
            {rflVotes
              .filter(({ organism }) => organism === currentRFI.organism)
              .map(({ organism, required }) => (
                <TableRow>
                  <TableCell>0xadf...</TableCell>
                  <TableCell>Developer</TableCell>
                  <TableCell>{required} NLT</TableCell>
                  <StyledTableCell>
                    <Button>
                      <IconCheck /> Accept
                    </Button>
                    <Button>
                      <IconCross /> Reject
                    </Button>
                    <Field placeholder="Enter amount..." />
                  </StyledTableCell>
                </TableRow>
              ))}
          </Table>
        </Box>
      </MainContainer>
    )
  }
}
