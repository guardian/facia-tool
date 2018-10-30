import styled, { css } from 'styled-components'

export default styled('div')<{
  displayType?: 'default' | 'polaroid'
}>`
  position: relative;
  ${({ displayType }) => displayType === 'default' && css`width: calc(100% - 210px);`}
  padding: 0 8px;
`;
