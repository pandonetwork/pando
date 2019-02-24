import React from 'react'
import styled from 'styled-components'
import Highlight, { defaultProps } from 'prism-react-renderer'
import Theme from '../Theme'

export default class Display extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { file } = this.props

    return (
      <Wrapper>
        <Highlight {...defaultProps} code={file} language="javascript" theme={Theme}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={style}>
              {tokens.map((line, i) => (
                <div {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  margin-top: 0.5rem;
  padding: 10px;
  border: 1px solid #d1d1d1;
  border-radius: 3px;
  background-color: white;
`
