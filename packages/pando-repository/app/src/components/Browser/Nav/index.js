import React from 'react'
import styled from 'styled-components'

export default class Nav extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { nav, goto } = this.props

    return (
      <Wrapper>
        {nav.map((entry, idx) =>
          idx !== nav.length - 1 ? (
            <LinkSpan key={idx}>
              <LinkColor
                title={entry}
                onClick={() => { goto(idx) }}
              >
                {entry.toString()}
              </LinkColor>
              /
            </LinkSpan>
          ) : (
            <LinkSpan key={idx}>{entry}</LinkSpan>
          )
        )}
      </Wrapper>
    )
  }
}

const Wrapper = styled.span`
  margin-left: 15px;
`

const LinkColor = styled.a`
  margin-right: 5px;
  color: #02cbe6;
  &:hover {
    cursor: pointer;
    display: inline-block;
    text-decoration: underline;
  }
`

const LinkSpan = styled.span`
  margin-right: 5px;
`
