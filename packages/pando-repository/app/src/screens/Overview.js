import { EmptyStateCard } from '@aragon/ui'
import React from 'react'
import Box from '../components/Box'

export default ({ branches }) => {
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

  return <h1>Overview here...</h1>
}
