import React from 'react'
import styled from 'styled-components'

import Browser from '../components/Browser'

const Container = styled.div`
  margin: 0 auto;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
`

export default function Organism(props) {
  return (
    <Container>
      <Browser name={props.name} tree={props.tree} />
    </Container>
  )
}
