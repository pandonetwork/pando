import React from 'react'
import styled from 'styled-components'
import IconFile from '../Icons/File'
import IconFolder from '../Icons/Folder'

class Parent extends React.Component {
  render() {
    const { onClick } = this.props

    return (
      <Row
        onClick={() => {
          onClick()
        }}
      >
        <Column>
          <Link title="..">..</Link>
        </Column>
      </Row>
    )
  }
}

class File extends React.Component {
  render() {
    const { name, hash, onClick } = this.props

    return (
      <Row
        onClick={() => {
          onClick(name, hash)
        }}
      >
        <Column>
          <IconFile mr=".5rem" />
          <Link title={name}>{name}</Link>
        </Column>
      </Row>
    )
  }
}

class Folder extends React.Component {
  render() {
    const { name, hash, onClick } = this.props

    return (
      <Row
        onClick={() => {
          onClick(name, hash)
        }}
      >
        <Column>
          <IconFolder mr=".5rem" />
          <Link title={name}>{name}</Link>
        </Column>
      </Row>
    )
  }
}

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
  border-bottom: 1px solid #e6e6e6;
  font-size: 14px;
`

const Link = styled.a`
  &:hover {
    display: inline-block;
    text-decoration: underline;
  }
`

const Entry = {
  Parent: Parent,
  File: File,
  Folder: Folder,
}

export default Entry
