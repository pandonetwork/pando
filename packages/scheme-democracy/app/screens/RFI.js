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
  ProgressBar,
  theme,
  EmptyStateCard,
} from '@aragon/ui'

import Organism from './Organism'

import Box from '../components/Box'

import emptyIcon from '../assets/empty-card.svg'

const EmptyIcon = <img src={emptyIcon} alt="" />

const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
`

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
  margin-right: 2rem;
`

const StyledBox = styled(Box)`
  align-items: center;
`

export default class App extends React.Component {
  state = {
    amount: '',
  }
  render() {
    const { currentTab, rfiVotes, rfiIndex, rflVotes } = this.props
    const currentRFI = rfiVotes[rfiIndex]
    console.log('currenttab', currentTab)

    if (currentTab.title === 'Lineage') {
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
                <TableCell>{currentRFI.metadata.message}</TableCell>
                <TableCell>{currentRFI.organism}</TableCell>
                <TableCell>
                  {currentRFI.state === '0' && (
                    <Box
                      width="100%"
                      flexDirection="column"
                      alignItems="flex-start"
                    >
                      <Box
                        width="100%"
                        display="flex"
                        flexDirection="column"
                        mb="1rem"
                      >
                        <StyledBox width="100%" display="flex" mb="1rem">
                          <Box mr="1rem">
                            <IconCheck />
                          </Box>
                          <ProgressBar
                            color={theme.positive}
                            progress={currentRFI.yea / currentRFI.participation}
                          />
                        </StyledBox>
                        <StyledBox width="100%" display="flex">
                          <Box mr="1rem">
                            <IconCross />
                          </Box>
                          <ProgressBar
                            color={theme.negative}
                            progress={currentRFI.nay / currentRFI.participation}
                          />
                        </StyledBox>
                      </Box>
                      <Box display="flex">
                        <Button
                          onClick={() =>
                            this.props.app.mergeRFI(
                              currentRFI.organism,
                              currentRFI.RFIid
                            )
                          }
                        >
                          <IconCheck /> Accept
                        </Button>
                        <Button
                          onClick={() =>
                            this.props.app.rejectRFI(
                              currentRFI.organism,
                              currentRFI.RFIid
                            )
                          }
                        >
                          <IconCross /> Reject
                        </Button>
                      </Box>
                    </Box>
                  )}
                  {currentRFI.state === '1' && (
                    <StyledBox width="100%" display="flex">
                      <Box mr="1rem">
                        <IconCheck />
                      </Box>
                      <Text color={theme.positive}>Executed</Text>
                    </StyledBox>
                  )}
                  {currentRFI.state === '2' && (
                    <StyledBox width="100%" display="flex">
                      <Box mr="1rem">
                        <IconCross />
                      </Box>
                      <Text color={theme.negative}>Cancelled</Text>
                    </StyledBox>
                  )}
                </TableCell>
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
                  <TableHeader title="ID" />
                  <TableHeader title="Receiver" />
                  <TableHeader title="For" />
                  <TableHeader title="Minimum" />
                  <TableHeader title="Actions" />
                </TableRow>
              }
            >
              {rflVotes
                .filter(({ organism }) => organism === currentRFI.organism)
                .sort((prev, next) => {
                  return prev.state === '0' && next.state !== '0'
                    ? -1
                    : prev.state !== '0' && next.state === '0'
                    ? 1
                    : prev.RFLid === currentRFI.RFIid &&
                      next.RFLid !== currentRFI.RFIid
                    ? -1
                    : prev.RFLid !== currentRFI.RFIid &&
                      next.RFLid === currentRFI.RFIid
                    ? 1
                    : 0
                })
                .map(({ organism, RFLid, metadata, state }) => (
                  <TableRow>
                    <TableCell>RFL #{RFLid}</TableCell>
                    <TableCell>{metadata.destination}</TableCell>
                    <TableCell>Developer</TableCell>
                    <TableCell>{metadata.minimum} NLT</TableCell>
                    <TableCell>
                      {state === '0' && (
                        <Box display="flex" alignItems="center">
                          <Button
                            onClick={() =>
                              this.props.app.acceptRFL(
                                organism,
                                RFLid,
                                this.state.amount
                              )
                            }
                          >
                            <IconCheck /> Accept
                          </Button>
                          <Field
                            placeholder="Enter amount..."
                            onChange={e =>
                              this.setState({ amount: e.target.value })
                            }
                          />
                          <Button
                            onClick={() =>
                              this.props.app.rejectRFL(organism, RFLid)
                            }
                          >
                            <IconCross /> Reject
                          </Button>
                        </Box>
                      )}
                      {state === '1' && (
                        <StyledBox width="100%" display="flex">
                          <Box mr="1rem">
                            <IconCheck />
                          </Box>
                          <Text color={theme.positive}>Executed</Text>
                        </StyledBox>
                      )}
                      {state === '2' && (
                        <StyledBox width="100%" display="flex">
                          <Box mr="1rem">
                            <IconCross />
                          </Box>
                          <Text color={theme.negative}>Cancelled</Text>
                        </StyledBox>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </Table>
          </Box>
        </MainContainer>
      )
    }

    if (currentTab.title === 'Code') {
      return (
        <Organism
          name={currentRFI.metadata.message}
          tree={currentRFI.metadata.tree}
        />
      )
    }

    if (currentTab.title === 'Conversation') {
      return (
        <EmptyContainer>
          <EmptyStateCard
            icon={EmptyIcon}
            title="Conversation"
            text="Coming soon..."
          />
        </EmptyContainer>
      )
    }
  }
}
