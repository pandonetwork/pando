import { Text, theme } from '@aragon/ui'
import Octicon, { Check, CircleSlash, GitMerge, GitPullRequest } from '@githubprimer/octicons-react'
import React from 'react'
import styled from 'styled-components'
import Box from '../components/Box'
import PushRequest from '../components/PushRequest'

const PR_STATE = ['PENDING', 'MERGED', 'REJECTED'].reduce((state, key, index) => {
  state[key] = index
  return state
}, {})

// const testData = [
//   {
//     type: 'PR',
//     state: PR_STATE.PENDING,
//     author: '0xabcd...',
//     title: 'Title here...',
//     description: 'Some description here...',
//     destination: 'some-branch',
//     head: '',
//   },
//   {
//     type: 'PR',
//     state: PR_STATE.PENDING,
//     author: '0xabcd...',
//     title: 'Title here...',
//     description: 'Some description here...',
//     destination: 'some-branch',
//     head: '',
//   },
//   {
//     type: 'PR',
//     state: PR_STATE.MERGED,
//     author: '0xabcd...',
//     title: 'Title here...',
//     description: 'Some description here...',
//     destination: 'some-branch',
//     head: '',
//   },
//   {
//     type: 'PR',
//     state: PR_STATE.REJECTED,
//     author: '0xabcd...',
//     title: 'Title here...',
//     description: 'Some description here...',
//     destination: 'some-branch',
//     head: '',
//   },
// ]

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

export default class Requests extends React.Component {
  static defaultProps = {
    branches: [],
    PRs: [],
    merge: () => {},
    reject: () => {},
  }

  constructor(props) {
    super(props)

    this.back = this.back.bind(this)

    this.state = {
      viewState: 'open',
      currentPR: null,
    }
  }

  back() {
    this.setState({ viewState: 'open' })
  }

  render() {
    const { branches, PRs, merge, reject } = this.props
    const { viewState, currentPR } = this.state

    const openCount = PRs.filter(({ state }) => state === PR_STATE.PENDING).length
    const closedCount = PRs.filter(({ state }) => state !== PR_STATE.PENDING).length

    let items

    if (viewState === 'open') {
      items = PRs.filter(({ state }) => state === PR_STATE.PENDING).map(PR => (
        <TableItem key={PR.id} onClick={() => this.setState({ viewState: 'pull-request', currentPR: PR })}>
          <Box mr="0.5rem" color="#28a745">
            <Octicon icon={GitPullRequest} />
          </Box>
          <Box display="flex" flexDirection="column">
            <Text size="large" weight="bold">
              {PR.title}
              <Text size="large" weight="bold" color={theme.textSecondary}>
                {' '}
                #{PR.id}
              </Text>
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
        <TableItem key={PR.id} onClick={() => this.setState({ viewState: 'pull-request', currentPR: PR })}>
          {PR.state === PR_STATE.MERGED && (
            <Box mr="0.5rem" color="#6f42c1">
              <Octicon icon={GitMerge} />
            </Box>
          )}
          {PR.state === PR_STATE.REJECTED && (
            <Box mr="0.5rem" color="#cb2331">
              <Octicon icon={CircleSlash} />
            </Box>
          )}
          <Box display="flex" flexDirection="column">
            <Text size="large" weight="bold">
              {PR.title}
              <Text size="large" weight="bold" color={theme.textSecondary}>
                {' '}
                #{PR.id}
              </Text>
            </Text>

            <Text size="small" color="#666666">
              opened by {PR.author}
            </Text>
          </Box>
        </TableItem>
      ))
    }

    if (viewState === 'pull-request') {
      return <PushRequest branch={branches[currentPR.destination]} PR={currentPR} back={this.back} merge={merge} reject={reject} />
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
