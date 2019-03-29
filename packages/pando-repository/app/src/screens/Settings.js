import { Button, Info, Table, TableHeader, TableRow, TableCell, Text, theme } from '@aragon/ui'
import React from 'react'
import styled from 'styled-components'

export default ({ name, description, handleUpdateInformationsSidePanelOpen }) => {
  return (
    <Wrapper>
      <Table
        header={
          <TableRow>
            <TableHeader title="Information" />
          </TableRow>
        }
      >
        <TableRow>
          <TableCell>
            <Text weight="bold">{name}</Text>
          </TableCell>
          <TableCell>
            <Text>{description}</Text>
          </TableCell>
          <TableCellLeft>
            <Button mode="secondary" onClick={() => handleUpdateInformationsSidePanelOpen()}>
              Update
            </Button>
          </TableCellLeft>
        </TableRow>
      </Table>

      <Table
        header={
          <TableRow>
            <TableHeader title="Permissions" />
          </TableRow>
        }
      >
        <TableRow>
          <TableCellFull>
            <Info.Permissions title="Coming soon">
              <Text color={theme.textTertiary}>
                In the meanwhile head to the <i>Permissions</i> app in the left panel ...
              </Text>
            </Info.Permissions>
          </TableCellFull>
        </TableRow>
      </Table>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin: 0 auto;
  min-width: 30vw;
  max-width: 980px;

  table {
    width: 100%;

    &:not(:first-child) {
      margin-top: 20px;
    }
  }
`

const TableCellLeft = styled(TableCell)`
  * {
    float: right;
  }
`

const TableCellFull = styled(TableCell)`
  padding: 0;

  div,
  section {
    width: 100%;
  }
`
