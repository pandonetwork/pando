import styled from 'styled-components'
import {
  alignItems,
  color,
  display,
  flexDirection,
  height,
  justifyContent,
  space,
} from 'styled-system'

export default styled.div`
  ${space}
  ${display}
  ${alignItems}
  ${justifyContent}
  ${height}
  ${flexDirection}
  ${color}
  ${({ cursor }) => cursor && `cursor: ${cursor}`}
`
