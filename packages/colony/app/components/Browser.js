import React, { useState } from 'react'
import styled from 'styled-components'

import IconFile from './IconFile'
import IconFolder from './IconFolder'

const Container = styled.div`
  margin-top: 0.5rem;
  border: 1px solid #d1d1d1;
  border-bottom: none;
  border-radius: 3px;
  background-color: white;
`

const Table = styled.table`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
`

const Row = styled.tr`
  &:hover {
    background-color: #f6fafe;
    cursor: pointer;
  }
`

const Column = styled.td`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #d1d1d1;
  font-size: 14px;
`

const Link = styled.a`
  &:hover {
    display: inline-block;
    text-decoration: underline;
  }
`

function renderItems(state, latestState, setState, name, type) {
  if (type === 'dir') {
    return (
      <Row
        onClick={() => {
          state.push({ depth: latestState.depth + 1, parent: name })
          setState(state)
        }}
      >
        <Column>
          <IconFolder mr=".5rem" />
          <Link title={name}>{name}</Link>
        </Column>
      </Row>
    )
  } else if (type === 'file') {
    return (
      <Row>
        <Column>
          <IconFile mr=".5rem" />
          <Link title={name}>{name}</Link>
        </Column>
      </Row>
    )
  }
}

export default function Browser({ data, state, setState }) {
  const latestState = state[state.length - 1]
  let content = data.map(({ depth, type, name, path }) => {
    if (latestState.depth === 1 && depth === latestState.depth) {
      return renderItems(state, latestState, setState, name, type)
    }
    if (
      latestState.depth > 1 &&
      depth === latestState.depth &&
      path.split('/')[latestState.depth - 1] === latestState.parent
    ) {
      return renderItems(state, latestState, setState, name, type)
    }
  })
  if (latestState.depth > 1) {
    content.unshift(
      <Row
        onClick={() => {
          state.pop()
          setState(state)
        }}
      >
        <Column>..</Column>
      </Row>
    )
  }
  return (
    <Container>
      <Table>
        <tbody>{content}</tbody>
      </Table>
    </Container>
  )
}
