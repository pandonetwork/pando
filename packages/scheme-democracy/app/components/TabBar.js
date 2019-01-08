import React, { PureComponent } from 'react'
import styled from 'styled-components'
import { Text, theme, unselectable } from '@aragon/ui'

const StyledTabbedView = styled.div`
  margin-top: 6rem;
  width: 100%;
`

const StyledTabBar = styled.nav`
  line-height: 31px;
  padding-left: 30px;
  background: ${theme.contentBackground};
  border-bottom: 1px solid ${theme.contentBorder};
`

const StyledTab = styled.div`
  ${unselectable};
  padding-top: 4px;
  display: inline-block;
  cursor: pointer;
  height: 37px;
  margin-right: 50px;
  transition: all 0.5s cubic-bezier(0.38, 0.8, 0.32, 1.07);
  &.active {
    cursor: default;
    text-shadow: 0.1px 0 0 ${theme.textPrimary}, -0.1px 0 0 ${theme.textPrimary};
    border-bottom: 4px solid ${theme.accent};
  }
  &:hover:not(.active) {
    color: ${theme.textSecondary};
  }
`

export default props => (
  <StyledTabbedView>
    <StyledTabBar>
      {props.data.map((title, idx) => (
        <StyledTab
          className={props.selected === idx ? 'active' : ''}
          onClick={() => props.onSelect(idx)}
          key={title}
        >
          <Text>{title}</Text>
        </StyledTab>
      ))}
    </StyledTabBar>
  </StyledTabbedView>
)
