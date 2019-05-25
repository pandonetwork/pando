import React from 'react'
import styled from 'styled-components'
import Octicon, { Bold, Italic, TextSize, Quote, Code, Link, ListUnordered } from '@githubprimer/octicons-react'

import { Button, TabBar } from '@aragon/ui'

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
  <TabBarWrapper>
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
          <EditToolBarSeparator />
        </EditToolBar>
      )}
    </div>
  </TabBarWrapper>
)

const TabBarWrapper = styled.div`
  margin: 10px 15px 0 30px;
`

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
