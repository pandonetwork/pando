import React, { useState } from 'react'
import styled from 'styled-components'
import { EmptyStateCard, IconHome } from '@aragon/ui'
import Browser from '../components/Browser'

import data from '../data'

const Container = styled.div`
  margin: 0 auto;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
`

const ActiveText = styled.span`
  font-weight: 500;
`

const LinkBold = styled(ActiveText)`
  color: #0366d6;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`

const Link = styled.span`
  color: #0366d6;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`

const Seperator = styled.span`
  color: #586069;
  margin: 0 0.25rem;
`

export default function Organism(props) {
  let browser

  const organism = props.organism

  const [state, setState] = useState([{ depth: 1, parent: '' }])

  const content = state.map((item, idx) => {
    if (state.length < 2) {
      return <ActiveText>{organism.message}</ActiveText>
    } else {
      if (idx === 0) {
        return <LinkBold onClick={() => setState([state[0]])}>{organism.address}</LinkBold>
      }
      if (state.length - 1 === idx) {
        return (
          <span>
            <Seperator>/</Seperator>
            <ActiveText>{item.parent}</ActiveText>
          </span>
        )
      }
      return (
        <span>
          <Seperator>/</Seperator>
          <Link onClick={() => setState(state.splice(0, state.length - idx))}>{item.parent}</Link>
        </span>
      )
    }
  })

  if (typeof organism.files === 'undefined') {
    browser = <EmptyStateCard text="No individuation yet" icon={() => <IconHome color="blue" />} />
  } else {
    browser = <Browser data={organism.files} state={state} setState={state => setState(state)} />
  }

  // const browser =
  //   typeof organism.files !== 'undefined ' ? (
  //     <Browser data={organism.files} state={state} setState={state => setState(state)} />
  //   ) : (
  //     <EmptyStateCard text="No individuation yet" icon={() => <IconHome color="blue" />} />
  //   )

  return (
    <Container>
      {content}
      {browser}
    </Container>
  )
}
