import styled, { css } from 'styled-components';
import HoverActions from '../CollectionHoverItems';
import Thumbnail from '../Thumbnail';

export default styled('div')<{
  fade?: boolean;
  size?: 'default' | 'small';
  tone?: string | void;
  displayType?: 'default' | 'polaroid';
}>`
  position: relative;
  ${({ displayType }) =>
    displayType === 'default' &&
    css`
      display: flex;
      border-top: 1px solid #333;
    `}
  ${({ displayType }) =>
    displayType === 'polaroid' &&
    css`
      font-size: 14px;
    `}
  min-height: ${({ size }) => (size === 'small' ? '35px' : '83px')}
  cursor: pointer;
  background-color: ${({ displayType }) =>
    displayType === 'default' ? 'white' : 'transparent'}
  opacity: ${({ fade }) => (fade ? 0.5 : 1)};
  :hover {
    background-color: ${({ displayType }) =>
      displayType === 'default' ? '#ededed' : 'transparent'}

    ${HoverActions} {
      transition-delay: 0s;
      visibility: visible;
      opacity: 1;
    }

    ${Thumbnail} {
      opacity: 0.2;
    }
  }
`;
