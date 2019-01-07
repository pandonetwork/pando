import React from 'react'
import Box from './Box'

export default props => (
  <Box display="flex" alignItems="center" {...props}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"
        fill="rgb(0, 164, 209)"
      />
    </svg>
  </Box>
)
