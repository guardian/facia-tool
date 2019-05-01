import styled, { css } from 'styled-components';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';
import Thumbnail from '../Thumbnail';
import {
  CollectionItemDisplayTypes,
  CollectionItemSizes
} from 'shared/types/Collection';

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
      border-top: ${({ theme }) =>
        `1px solid ${theme.shared.base.colors.text}`};
    `}
  ${({ displayType, size }) =>
    displayType === 'polaroid' &&
    `font-size: ${size === 'small' ? '12px' : '13px'};`}
  min-height: ${({ size }) => (size === 'small' ? '25px' : '67px')};
  cursor: pointer;
  background-color: ${({ displayType, theme }) =>
    displayType === 'default'
      ? theme.shared.base.colors.backgroundColorLight
      : 'transparent'};
  opacity: ${({ fade }) => (fade ? 0.5 : 1)};

  ${HoverActionsAreaOverlay} {
    ${({ displayType }) =>
      displayType === 'polaroid'
        ? `bottom: 0px; right: 0px;`
        : `bottom: 4px; left: 8px;`}
    position: absolute;
    visibility: hidden;
  }

  :hover {
    background-color: ${({ displayType, theme }) =>
      displayType === 'default'
        ? theme.shared.base.colors.backgroundColorFocused
        : 'transparent'};

      ${HoverActionsAreaOverlay} {
        transition-delay: 0s;
        visibility: visible;
      }

    ${Thumbnail} {
      opacity: 0.4;
    }
  }
`;
