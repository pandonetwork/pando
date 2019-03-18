import React from 'react'
import Browser from '../components/Browser'

export default ({ repo, branches }) => (
  <Browser name={repo.name} branches={branches} />
)
