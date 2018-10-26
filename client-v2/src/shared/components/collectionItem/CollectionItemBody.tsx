import styled from 'styled-components';
import HoverActions from '../CollectionHoverItems';
import Thumbnail from '../Thumbnail';

export default styled('div')<{
  fade?: boolean;
  size?: 'default' | 'small';
  tone?: string | void
}>`
  display: flex;
  position: relative;
  border-top: 1px solid #333;
  min-height: 35px;
  cursor: pointer;
  position: relative;
  min-height: ${({ size }) => (size === 'small' ? '35px' : '83px')}
  opacity: ${({ fade }) => (fade ? 0.5 : 1)};
  :hover {
    background-color: #ededed;

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
