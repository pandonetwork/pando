import Highlight, { defaultProps } from 'prism-react-renderer'
import React from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import styled, { createGlobalStyle } from 'styled-components'
import { prismMapping } from '../constants'
import Theme from '../Theme'

const MonoStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Overpass+Mono:300');
`

const MarkdownWrapper = styled.div`
  padding: 2rem;
  h1 {
    font-size: 2em;
    font-weight: 600;
    border-bottom: 1px solid #eaecef;
    margin: 2rem 0;
  }
  h2 {
    font-size: 1.5em;
    font-weight: 600;
    border-bottom: 1px solid #eaecef;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  p {
    margin-bottom: 1rem;
  }
  a {
    color: #0366d6;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  a > code,
  p > code {
    background-color: rgba(27, 31, 35, 0.05);
    border-radius: 3px;
    padding: 0.2em 0.4em;
  }
  table {
    border-collapse: collapse;
  }

  tr {
    border-top: 1px solid #c6cbd1;
  }
  tr:nth-child(2n) {
    background-color: #f6f8fa;
  }
  th,
  td {
    border: 1px solid #dfe2e5;
    padding: 6px 13px;
  }
  pre {
    margin: 0;
    background-color: #f6f8fa;
    border-radius: 3px;
    overflow: auto;
    padding: 16px;
  }
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
        {language === 'markdown' && (
          <MarkdownWrapper>
            <ReactMarkdown source={normalizedFile} escapeHtml={false} />
          </MarkdownWrapper>
        )}
        {language !== 'markdown' && (
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
        )}
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  margin-top: 0.5rem;
  padding: 10px;
  border: 1px solid #e6e6e6;
  border-radius: 3px;
  background-color: white;
  overflow-x: scroll;

  pre {
    font-family: 'Overpass Mono';
    font-size: 0.9em;
  }
`
