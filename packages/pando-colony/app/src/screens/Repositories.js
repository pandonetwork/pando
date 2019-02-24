import React from 'react'
import styled from 'styled-components'
import { Badge, Text, theme } from '@aragon/ui'

export default class Repositories extends React.Component {
  render() {
    const { repositories } = this.props

    console.log(repositories)

    return (
      <Wrapper>
        <React.Fragment>
          {
            repositories.map((repository) => (

              <Repository key={repository.address}>
                <div className="name"><Text size="x-large" weight="bold">{repository.name}</Text></div>
                <div className="address"><Badge.Identity>{repository.address}</Badge.Identity></div>
                <div className="description"><Text>{repository.description}</Text></div>
              </Repository>
            ))

          }
        </React.Fragment>
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  margin: auto;
`

const Repository = styled.div`
  border-bottom: 1px solid ${theme.contentBorder};
  padding: 30px;
  &:first-child {
    border-top: 1px solid ${theme.contentBorder};
  }
  .name {
    color: ${theme.accent};
  }
`
