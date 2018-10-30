import styled, { css } from 'styled-components';
import {
  HoverActionsAreaOverlay,
  HideMetaDataOnToolTipDisplay
} from '../CollectionHoverItems';
import Thumbnail from '../Thumbnail';
import { CollectionItemDisplayTypes, CollectionItemSizes } from 'shared/types/Collection';

export default styled('div')<{
  fade?: boolean;
  size?: CollectionItemSizes;
  tone?: string | void;
  displayType?: CollectionItemDisplayTypes;
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
    background-color: ${({ displayType }) =>
      displayType === 'default' ? '#ededed' : 'transparent'}

      ${HoverActionsAreaOverlay} {
        transition-delay: 0s;
        visibility: visible;
        opacity: 1;
        ${HideMetaDataOnToolTipDisplay} {
          visibility: visible;
        }
      }

    ${Thumbnail} {
      opacity: 0.4;
    }
  }
`;
