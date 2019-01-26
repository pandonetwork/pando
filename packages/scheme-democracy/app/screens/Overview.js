import React from 'react'
import styled from 'styled-components'
import {
  Text,
  EmptyStateCard,
  Table,
  TableRow,
  TableHeader,
  TableCell,
  ProgressBar,
  theme,
  IconCheck,
  IconCross,
} from '@aragon/ui'

import Box from '../components/Box'

import emptyIcon from '../assets/empty-card.svg'

const EmptyIcon = <img src={emptyIcon} alt="" />

const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
`

const StyledTableCell = styled(TableCell)`
  & > div {
    display: flex;
    flex-direction: column;
  }
`

const StyledTableRow = styled(TableRow)`
  &:hover {
    cursor: pointer;
  }
`

const StyledBox = styled(Box)`
  align-items: center;
`

export default props => (
  <div>
    {!props.rfiVotes.length && (
      <EmptyContainer>
        <EmptyStateCard
          icon={EmptyIcon}
          title="No RFIs"
          text="Waiting for RFIs..."
        />
      </EmptyContainer>
    )}

    {!!props.rfiVotes.length && (
      <div>
        <Box mb="0.5rem">
          <Text weight="bold">Open RFIs</Text>
        </Box>

        <Table
          header={
            <TableRow>
              <TableHeader title="ID" />
              <TableHeader title="Message" />
              <TableHeader title="Participation" />
              <TableHeader title="State" />
            </TableRow>
          }
        >
          {props.rfiVotes
            .filter(({ state }) => state === '0')
            .map(({ RFIid, participation, yea, nay, metadata }) => (
              <StyledTableRow
                onClick={() =>
                  props.forward(`RFI #${RFIid}`, Number(RFIid) - 1)
                }
              >
                <TableCell>RFI #{RFIid}</TableCell>
                <TableCell>{metadata.message}</TableCell>
                <TableCell>
                  {participation > 1
                    ? participation + ' participants'
                    : participation + ' participant'}
                </TableCell>
                <StyledTableCell>
                  <StyledBox width="100%" display="flex" mb="1rem">
                    <Box mr="1rem">
                      <IconCheck />
                    </Box>
                    <ProgressBar
                      color={theme.positive}
                      progress={yea / participation}
                    />
                  </StyledBox>
                  <StyledBox width="100%" display="flex">
                    <Box mr="1rem">
                      <IconCross />
                    </Box>
                    <ProgressBar
                      color={theme.negative}
                      progress={nay / participation}
                    />
                  </StyledBox>
                </StyledTableCell>
              </StyledTableRow>
            ))}
        </Table>
      </div>
    )}

    {!!props.rfiVotes.length && (
      <Box mt="2rem">
        <Box mb="0.5rem">
          <Text weight="bold">Past RFIs</Text>
        </Box>
        <Table
          header={
            <TableRow>
              <TableHeader title="ID" />
              <TableHeader title="Message" />
              <TableHeader title="Participation" />
              <TableHeader title="State" />
            </TableRow>
          }
        >
          {props.rfiVotes
            .filter(({ state }) => state !== '0')
            .map(({ RFIid, participation, state, metadata }) => (
              <StyledTableRow
                onClick={() =>
                  props.forward(`RFI #${RFIid}`, Number(RFIid) - 1)
                }
              >
                <TableCell>RFI #{RFIid}</TableCell>
                <TableCell>{metadata.message}</TableCell>
                <TableCell>
                  {participation > 1
                    ? participation + ' participants'
                    : participation + ' participant'}
                </TableCell>
                <StyledTableCell>
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
                </StyledTableCell>
              </StyledTableRow>
            ))}
        </Table>
      </Box>
    )}
  </div>
)
