import React from 'react'
import styled from 'styled-components'
import Entry from '../Entry'

export default class Tree extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { tree, parents, forward, backward, display } = this.props

    return (
      <Wrapper>
        <Table>
          <tbody>
            {parents.length > 0 && <Entry.Parent onClick={backward} />}
            <React.Fragment>
              {Object.keys(tree).map((name, idx) => {
                if (tree[name]['mode'] === '40000') {
                  return (
                    <Entry.Folder
                      key={name}
                      name={name}
                      hash={tree[name]['hash']['/']}
                      onClick={forward}
                    />
                  )
                } else {
                  return (
                    <Entry.File
                      key={name}
                      name={name}
                      hash={tree[name]['hash']['/']}
                      onClick={display}
                    />
                  )
                }
              })}
            </React.Fragment>
          </tbody>
        </Table>
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  margin-top: 1rem;
  border: 1px solid #e6e6e6;
  border-bottom: none;
  border-radius: 3px;
  background-color: white;
`

const Table = styled.table`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
`
