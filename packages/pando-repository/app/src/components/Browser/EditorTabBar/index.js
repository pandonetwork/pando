import { Button, TabBar } from '@aragon/ui'
import Octicon, { Bold, Code, Italic, Link, ListUnordered, Quote, TextSize } from '@githubprimer/octicons-react'
import React from 'react'
import styled from 'styled-components'

const EditorTabBar = ({
  screenIndex,
  handleScreenChange,
  handleSelectionBold,
  handleSelectionSize,
  handleSelectionItalic,
  handleSelectionQuote,
  handleSelectionLink,
  handleSelectionUnorderedList,
  handleSelectionCode,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <TabBar items={['Write', 'Preview']} selected={screenIndex} onChange={handleScreenChange} />
    {screenIndex === 0 && (
      <EditToolBar>
        <EditToolBarButton onClick={handleSelectionSize} compact>
          <Octicon icon={TextSize} />
        </EditToolBarButton>
        <EditToolBarButton onClick={handleSelectionBold} compact>
          <Octicon icon={Bold} />
        </EditToolBarButton>
        <EditToolBarButton onClick={handleSelectionItalic} compact>
          <Octicon icon={Italic} />
        </EditToolBarButton>
        <EditToolBarSeparator />
        <EditToolBarButton onClick={handleSelectionQuote} compact>
          <Octicon icon={Quote} />
        </EditToolBarButton>
        <EditToolBarButton onClick={handleSelectionCode} compact>
          <Octicon icon={Code} />
        </EditToolBarButton>
        <EditToolBarButton onClick={handleSelectionLink} compact>
          <Octicon icon={Link} />
        </EditToolBarButton>
        <EditToolBarButton onClick={handleSelectionUnorderedList} compact>
          <Octicon icon={ListUnordered} />
        </EditToolBarButton>
      </EditToolBar>
    )}
  </div>
)

const EditToolBar = styled.div`
  margin-top: 0px;
`

const EditToolBarButton = styled(Button)`
  width: 22px;
  height: 22px;
  text-align: center;
  padding: 0;
  margin: 0;
`

const EditToolBarSeparator = styled.div`
  display: inline-block;
  width: 10px;
  height: 1px;
`

export default EditorTabBar
