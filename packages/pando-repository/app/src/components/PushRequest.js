import { Text, theme } from '@aragon/ui'
import Octicon, { CircleSlash, GitMerge, GitPullRequest } from '@githubprimer/octicons-react'
import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
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
//     status: 'closed',
//     author: '0xabcd...',
//     title: 'Title here...',
//     description: 'Some description here...',
//     destination: 'some-branch',
//     head: '',
//   },
//   {
//     type: 'PR',
//     status: 'open',
//     author: '0xabcd...',
//     title: 'Title here...',
//     description: 'Some description here...',
//     destination: 'some-branch',
//     head: '',
//   },
//   {
//     type: 'PR',
//     status: 'open',
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

const ActionButtons = styled.div`
  float: right;

  button:last-child {
    margin-right: 0;
  }
`

// const oldCode = `const a = 10
// const b = 10
// const c = () => console.log('foo')
//
// if(a > 10) {
//   console.log('bar')
// }
//
// console.log('done')
// `
// const newCode = `const a = 10
// const boo = 10
//
// if(a === 10) {
//   console.log('bar')
// }
// `
// const data = [
//   {
//     path: 'path/to/file.js',
//     filename: 'file.js',
//     newCode,
//     oldCode,
//   },
//   {
//     path: 'path/to/file.js',
//     filename: 'file.js',
//     newCode,
//     oldCode,
//   },
// ]

export default class Requests extends React.Component {
  static defaultProps = {
    PRs: { state: undefined },
    head: undefined,
    back: () => {},
    merge: () => {},
    reject: () => {},
  }

  constructor(props) {
    super(props)

    this.ipfs = IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
    this.ipld = new IPLD({
      blockService: this.ipfs.block,
      formats: [IPLDGit],
    })

    this.state = {
      diffViewState: 'split',
      diffs: [],
    }
  }

  componentDidMount() {
    this.deriveDiffFromProps(this.props)
  }

  componentWillReceiveProps(props) {
    this.deriveDiffFromProps(props)
  }

  async deriveDiffFromProps(props) {
    const diffs = []
    const files = props.PR.commit.files
    const head = props.branch && this.props.branch[0] ? props.branch[0].files : {}

    for (let file in files) {
      if (!head[file]) {
        diffs.push({
          path: file,
          filename: file.split('/').pop(),
          newCode: (await this.get(files[file])).toString().split('\u0000')[1],
          oldCode: '',
        })
      } else if (head[file] !== files[file]) {
        diffs.push({
          path: file,
          filename: file.split('/').pop(),
          newCode: (await this.get(files[file])).toString().split('\u0000')[1],
          oldCode: (await this.get(head[file])).toString().split('\u0000')[1],
        })
      }
    }

    for (let file in head) {
      if (!files[file]) {
        diffs.push({
          path: file,
          filename: file.split('/').pop(),
          newCode: '',
          oldCode: (await this.get(head[file])).toString().split('\u0000')[1],
        })
      }
    }

    this.setState({ diffs })
  }

  async get(hash, path) {
    const cid = CID.isCID(hash) ? hash : new CID(hash)

    return new Promise((resolve, reject) => {
      this.ipld.get(cid, path, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result.value)
        }
      })
    })
  }

  render() {
    const { PR, merge, reject, back } = this.props
    const { diffs, diffViewState } = this.state

    return (
      <Wrapper>
        <BackButton onClick={() => back()}>Go back</BackButton>
        <PRTitle>
          {PR.title}
          <Text color={theme.textSecondary}> #{PR.id}</Text>
        </PRTitle>
        {PR.state === PR_STATE.PENDING && (
          <div>
            <ActionButtons>
              <Button onClick={() => merge(PR.id)}>Merge PR</Button>
              <Button onClick={() => reject(PR.id)}>Reject PR</Button>
            </ActionButtons>

            <Box display="flex" alignItems="center" color="#666666" mb="1rem">
              <Status color="#2cbe4e">
                <Box mr="0.25rem">
                  <Octicon icon={GitPullRequest} />
                </Box>
                <span>Open</span>
              </Status>
              <div>
                <Text weight="bold">{PR.author}</Text> wants to merge into
                <Text weight="bold"> {PR.destination}</Text>
              </div>
            </Box>
          </div>
        )}
        {PR.state === PR_STATE.MERGED && (
          <Box display="flex" alignItems="center" color="#666666" mb="1rem">
            <Status color="#6f42c1">
              <Box mr="0.25rem">
                <Octicon icon={GitMerge} />
              </Box>
              <span>Merged</span>
            </Status>
            <div>
              <Text weight="bold">{PR.author}</Text> merged into
              <Text weight="bold"> {PR.destination}</Text>
            </div>
          </Box>
        )}
        {PR.state === PR_STATE.REJECTED && (
          <Box display="flex" alignItems="center" color="#666666" mb="1rem">
            <Status color="#cb2331">
              <Box mr="0.25rem">
                <Octicon icon={CircleSlash} />
              </Box>
              <span>Rejected</span>
            </Status>
            <div>
              <Text weight="bold">{PR.author}</Text> rejected from
              <Text weight="bold"> {PR.destination}</Text>
            </div>
          </Box>
        )}
        <Text size="large">{PR.description}</Text>
        {diffs.map(({ path, oldCode, newCode, filename }) => (
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
      </Wrapper>
    )
  }
}
