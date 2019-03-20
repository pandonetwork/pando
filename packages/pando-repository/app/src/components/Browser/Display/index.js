import Highlight, { defaultProps } from 'prism-react-renderer'
import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { prismMapping } from '../constants'
import Theme from '../Theme'


const MonoStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Overpass+Mono:300');
`

export default class Display extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { file, filename } = this.props
    const normalizedFile = file.split('\u0000')[1] // TODO: find a better way to get rid of "blob 2610\u0000"
    const language = prismMapping[filename.split('.').pop()]

    return (
      <Wrapper>
        <MonoStyle />
        <Highlight
          {...defaultProps}
          code={normalizedFile}
          language={language}
          theme={Theme}
        >
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
  overflow-x: scroll;

  pre {
    font-family: 'Overpass Mono';
    font-size: 0.9em;
  }
`
