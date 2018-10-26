import styled, { css } from 'styled-components';
import HoverActions from '../CollectionHoverItems';
import Thumbnail from '../Thumbnail';

export default styled('div')<{
  fade?: boolean;
  size?: 'default' | 'small';
  tone?: string | void,
  displayType?: 'default' | 'polaroid'
}>`
  position: relative;
  display: flex;
  position: relative;
  ${({ displayType }) => displayType === 'default' && css`border-top: 1px solid #333;`}
  min-height: 35px;
  cursor: pointer;
  ${({ displayType }) => displayType === 'polaroid' && css`font-size: 14px;`}
  min-height: ${({ size }) => (size === 'small' ? '35px' : '83px')}
  opacity: ${({ fade }) => (fade ? 0.5 : 1)};
  background-color: ${({ displayType }) => displayType === 'default' ? 'white' : 'transparent'}
  :hover {
    background-color: ${({ displayType }) => displayType === 'default' ? '#ededed' : 'transparent'}

    ${HoverActions} {
      transition-delay: 0s;
      visibility: visible;
      opacity: 1;
    }

    ${Thumbnail} {
      opacity: 0.2;
    }
  }
`
