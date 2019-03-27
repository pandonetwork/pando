import { Text } from '@aragon/ui'
import Octicon, { Check, CircleSlash, GitMerge, GitPullRequest } from '@githubprimer/octicons-react'
import Prism from 'prismjs'
import React from 'react'
import ReactDiffViewer from 'react-diff-viewer'
import styled from 'styled-components'
import Box from '../components/Box'
import { prismMapping } from '../components/Browser/constants'
import Display from '../components/Browser/Display'

const PR_STATE = ['PENDING', 'MERGED', 'REJECTED'].reduce((state, key, index) => {
  state[key] = index
  return state
}, {})

const testData = [
  {
    type: 'PR',
    status: 'open',
    author: '0xabcd...',
    title: 'Title here...',
    description: 'Some description here...',
    destination: 'some-branch',
    head: '',
  },
  {
    type: 'PR',
    status: 'closed',
    author: '0xabcd...',
    title: 'Title here...',
    description: 'Some description here...',
    destination: 'some-branch',
    head: '',
  },
  {
    type: 'PR',
    status: 'open',
    author: '0xabcd...',
    title: 'Title here...',
    description: 'Some description here...',
    destination: 'some-branch',
    head: '',
  },
  {
    type: 'PR',
    status: 'open',
    author: '0xabcd...',
    title: 'Title here...',
    description: 'Some description here...',
    destination: 'some-branch',
    head: '',
  },
]

const Wrapper = styled.div`
  margin: 0 auto;
  width: 100%;
`

const Table = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 3px 3px 0 0;
  padding: 1rem;
`

const TableItem = styled.div`
  display: flex;
  width: 100%;
  padding: 1rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  border-left: 1px solid #e6e6e6;
  border-right: 1px solid #e6e6e6;

  &:hover {
    background-color: #f9f9f9f9;
    cursor: pointer;
  }
`

const PRTitle = styled.h1`
  font-size: 32px;
`

const Status = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ color }) => color};
  padding: 0.25rem 0.5rem;
  color: white;
  border-radius: 3px;
  font-weight: 600;
  margin-right: 0.5rem;
`

const DiffView = styled.div`
  margin-top: 1rem;
  background-color: white;
  border-radius: 3px;
  border: 1px solid #e6e6e6;

  table {
    border-collapse: collapse;
  }
`

const DiffViewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e6e6e6;
`

const DiffViewContent = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Overpass+Mono:300');

  overflow-x: auto;
  overflow-y: hidden;

  pre {
    font-family: 'Overpass Mono';
    font-size: 0.9em;
    margin: 0;
  }
  .punctuation {
    color: #24292e;
  }
  .keyword,
  .url {
    color: rgb(215, 58, 73);
  }
  .string,
  .attr-value {
    color: rgb(3, 47, 98);
  }
  .function,
  .attr-name {
    color: rgb(111, 66, 193);
  }
  .function-variable {
    color: rgb(0, 92, 197);
  }
  .comment {
    color: rgb(106, 115, 125);
  }
  .doctype,
  .tag,
  .title {
    color: #22863a;
  }
`

const Link = styled.a`
  text-decoration: none;
  &:hover {
    color: #0366d6;
    cursor: pointer;
  }
`

const BackButton = styled.button`
  position: absolute;
  right: 2rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid rgb(230, 230, 230);
  border-radius: 3px;

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.03) 0px 4px 4px 0px;
    cursor: pointer;
  }
`

const Button = styled.button`
  margin-top: 2rem;
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid rgb(230, 230, 230);
  border-radius: 3px;

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.03) 0px 4px 4px 0px;
    cursor: pointer;
  }
`

const oldCode = `const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')
`

const newCode = `const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}
`

const data = [
  {
    path: 'path/to/file.js',
    filename: 'file.js',
    newCode,
    oldCode,
  },
  {
    path: 'path/to/file.js',
    filename: 'file.js',
    newCode,
    oldCode,
  },
]

export default class Requests extends React.Component {
  state = {
    viewState: 'open',
    diffViewState: 'split',
    currentPR: null,
  }

  render() {
    const { PRs } = this.props
    const { viewState, currentPR, diffViewState } = this.state

    console.log('PRs from requests')
    console.log(PRs)

    const openCount = PRs.filter(({ state }) => state === PR_STATE.PENDING).length
    const closedCount = PRs.filter(({ state }) => state !== PR_STATE.PENDING).length

    let items

    if (viewState === 'open') {
      items = PRs.filter(({ state }) => state === PR_STATE.PENDING).map(PR => (
        <TableItem onClick={() => this.setState({ viewState: 'pull-request', currentPR: PR })}>
          <Box mr="0.5rem" color="#28a745">
            <Octicon icon={GitPullRequest} />
          </Box>
          <Box display="flex" flexDirection="column">
            <Text size="large" weight="bold">
              {PR.title}
            </Text>
            <Text size="small" color="#666666">
              opened by {PR.author}
            </Text>
          </Box>
        </TableItem>
      ))
    }

    if (viewState === 'closed') {
      items = PRs.filter(({ state }) => state !== PR_STATE.PENDING).map(PR => (
        <TableItem onClick={() => this.setState({ viewState: 'pull-request', currentPR: PR })}>
          <Box mr="0.5rem" color="#6f42c1">
            <Octicon icon={GitMerge} />
          </Box>
          <Box display="flex" flexDirection="column">
            <Text size="large" weight="bold">
              {PR.title}
            </Text>
            <Text size="small" color="#666666">
              merged by {PR.author}
            </Text>
          </Box>
        </TableItem>
      ))
    }

    if (viewState === 'pull-request') {
      const { author, state, title, description, destination } = currentPR
      return (
        <Wrapper>
          <BackButton onClick={() => this.setState({ viewState: 'open' })}>Go back</BackButton>
          <PRTitle>{title}</PRTitle>
          {state === PR_STATE.PENDING && (
            <Box display="flex" alignItems="center" color="#666666" mb="1rem">
              <Status color="#2cbe4e">
                <Box mr="0.25rem">
                  <Octicon icon={GitPullRequest} />
                </Box>
                <span>Open</span>
              </Status>
              <div>
                <Text weight="bold">{author}</Text> wants to merge into
                <Text weight="bold"> {destination}</Text>
              </div>
            </Box>
          )}
          {state === PR_STATE.MERGED && (
            <Box display="flex" alignItems="center" color="#666666" mb="1rem">
              <Status color="#6f42c1">
                <Box mr="0.25rem">
                  <Octicon icon={GitMerge} />
                </Box>
                <span>Merged</span>
              </Status>
              <div>
                <Text weight="bold">{author}</Text> merged into
                <Text weight="bold"> {destination}</Text>
              </div>
            </Box>
          )}
          {state === PR_STATE.REJECTED && (
            <Box display="flex" alignItems="center" color="#666666" mb="1rem">
              <Status color="#6f42c1">
                <Box mr="0.25rem">
                  <Octicon icon={CircleSlash} />
                </Box>
                <span>Merged</span>
              </Status>
              <div>
                <Text weight="bold">{author}</Text> rejected from
                <Text weight="bold"> {destination}</Text>
              </div>
            </Box>
          )}
          <Text size="large">{description}</Text>
          {data.map(({ path, oldCode, newCode, filename }) => (
            <DiffView>
              <DiffViewHeader>
                <Link onClick={() => this.setState({ diffViewState: 'file' })}>{path}</Link>
                <Box display="flex">
                  <Box mr="2rem">
                    <Link
                      onClick={() =>
                        this.setState({
                          diffViewState: diffViewState === 'file' ? 'split' : 'file',
                        })
                      }
                    >
                      {diffViewState === 'file' ? 'Diff file' : 'View file'}
                    </Link>
                  </Box>
                  <Link
                    onClick={() =>
                      this.setState({
                        diffViewState: diffViewState === 'split' ? 'single' : 'split',
                      })
                    }
                  >
                    {diffViewState === 'split' ? 'Single view' : 'Split view'}
                  </Link>
                </Box>
              </DiffViewHeader>
              {diffViewState !== 'file' && (
                <DiffViewContent>
                  <ReactDiffViewer
                    oldValue={oldCode}
                    newValue={newCode}
                    splitView={diffViewState === 'split'}
                    renderContent={code => (
                      <pre
                        style={{ display: 'inline' }}
                        dangerouslySetInnerHTML={{
                          __html: Prism.highlight(code, Prism.languages[prismMapping[filename.split('.').pop()]]),
                        }}
                      />
                    )}
                  />
                </DiffViewContent>
              )}
              {diffViewState === 'file' && <Display file={newCode} filename={filename} removeBorder plain />}
            </DiffView>
          ))}
          <Button onClick={() => console.log('Merge logic here...')}>Merge PR</Button>
          <Button onClick={() => console.log('Reject logic here...')}>Reject PR</Button>
        </Wrapper>
      )
    }

    return (
      <Wrapper>
        <Table>
          <Box display="flex">
            <Box display="flex" mr="1.5rem" onClick={() => this.setState({ viewState: 'open' })} cursor="pointer" color={viewState === 'open' ? '' : '#666666'}>
              <Box mr="0.5rem">
                <Octicon color="#28a745" icon={GitPullRequest} />
              </Box>
              <Text weight={viewState === 'open' ? 'bold' : ''}>{openCount} Open</Text>
            </Box>
            <Box display="flex" mr="1rem" onClick={() => this.setState({ viewState: 'closed' })} cursor="pointer" color={viewState === 'open' ? '#666666' : ''}>
              <Box mr="0.5rem">
                <Octicon icon={Check} />
              </Box>
              <Text weight={viewState === 'open' ? '' : 'bold'}>{closedCount} Closed</Text>
            </Box>
          </Box>
          {/* <Box>
            <span>Author</span>
            <span>Sort</span>
          </Box> */}
        </Table>
        {items}
      </Wrapper>
    )
  }
}
