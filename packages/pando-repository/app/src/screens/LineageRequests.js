import { EmptyStateCard } from '@aragon/ui'
import React from 'react'
import Box from '../components/Box'

export default () => (
  <Box display="flex" height="80vh" justifyContent="center" alignItems="center">
    <EmptyStateCard title="Lineage requests" text="Coming soon..." />
  </Box>
)
