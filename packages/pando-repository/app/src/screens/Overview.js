import CID from 'cids'
import IPFS from 'ipfs-http-client'
import IPLD from 'ipld'
import IPLDGit from 'ipld-git'
import React from 'react'
import Display from '../components/Browser/Display'

export default class Overview extends React.Component {
  constructor(props) {
    super(props)
    this.ipfs = IPFS({ host: 'localhost', port: '5001', protocol: 'http' })
    this.ipld = new IPLD({
      blockService: this.ipfs.block,
      formats: [IPLDGit],
    })
    this.state = {
      readme: null,
    }
  }

  componentDidMount() {
    const { branches } = this.props

    if (branches.length) {
      this.get(branches[0][1], 'tree').then(tree => {
        if (tree['README.md']) {
          this.get(tree['README.md'].hash['/']).then(buffer => {
            const content = buffer.toString()
            this.setState({ readme: content })
          })
        }
      })
    }
  }

  async get(hash, path) {
    return new Promise((resolve, reject) => {
      this.ipld.get(new CID(hash), path, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result.value)
        }
      })
    })
  }

  render() {
    const { branches } = this.props
    const { readme } = this.state

    if (branches.length === 0) {
      return (
        <Box
          display="flex"
          height="80vh"
          justifyContent="center"
          alignItems="center"
        >
          <EmptyStateCard
            title="Repository is empty"
            text="Make an initial commit to the repository to get started."
          />
        </Box>
      )
    }

    return (
      <div>
        <h1>Overview here...</h1>
        {readme && <Display file={readme} filename="README.md" />}
      </div>
    )
  }
}
