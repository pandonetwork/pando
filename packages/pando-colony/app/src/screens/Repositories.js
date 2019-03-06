import {
  AddressField,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  Text,
  Viewport,
} from '@aragon/ui'
import React from 'react'
import Box from '../components/Box'

export default class Repositories extends React.Component {
  render() {
    const { repositories } = this.props

    return (
      <Viewport>
        {({ above, below }) => (
          <Table
            header={
              <TableRow>
                <TableHeader title="Repository" />
                {above('medium') && <TableHeader title="Address" />}
              </TableRow>
            }
          >
            {repositories.map(repository => (
              <TableRow key={repository.address}>
                <TableCell>
                  <div>
                    <div>
                      <Text size="xlarge" weight="bold">
                        {repository.name}
                      </Text>
                    </div>
                    <div>
                      <Text>{repository.description}</Text>
                    </div>
                    {below('medium') && (
                      <Box mt="1rem">
                        <AddressField address={repository.address} />
                      </Box>
                    )}
                  </div>
                </TableCell>
                {above('medium') && (
                  <TableCell>
                    <AddressField address={repository.address} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </Table>
        )}
      </Viewport>
    )
  }
}
