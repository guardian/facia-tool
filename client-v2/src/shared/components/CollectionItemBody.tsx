import styled from 'styled-components';
import {
  HoverActionsAreaOverlay,
  HideMetaDataOnToolTipDisplay
} from './CollectionHoverItems';
import Thumbnail from './Thumbnail';

export default styled('div')<{
  fade?: boolean;
  size?: 'default' | 'small';
  tone?: string | void;
}>`
  display: flex;
  position: relative;
  border-top: 1px solid #333;
  min-height: 35px;
  cursor: pointer;
  position: relative;
  min-height: ${({ size }) => (size === 'small' ? '35px' : '83px')};
  opacity: ${({ fade }) => (fade ? 0.5 : 1)};
  background-color: white;

  ${HoverActionsAreaOverlay} {
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
    visibility: hidden;
    opacity: 0;
    ${HideMetaDataOnToolTipDisplay} {
      visibility: hidden;
    }
  }

  :hover {
    background-color: #ededed;

    ${Thumbnail} {
      opacity: 0.2;
    }

    ${HoverActionsAreaOverlay} {
      transition-delay: 0s;
      visibility: visible;
      opacity: 1;
      ${HideMetaDataOnToolTipDisplay} {
        visibility: visible;
      }
    }
  }
`;
