import { styled } from 'shared/constants/theme';
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
  border-top: ${({ theme }) => `1px solid ${theme.base.colors.text}`};
  min-height: 35px;
  cursor: pointer;
  position: relative;
  min-height: ${({ size }) => (size === 'small' ? '35px' : '83px')};
  opacity: ${({ fade }) => (fade ? 0.5 : 1)};
  background-color: ${({ theme }) => theme.base.colors.backgroundColorLight};

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
    background-color: ${({ theme }) =>
      theme.base.colors.backgroundColorFocused};

    ${Thumbnail} {
      opacity: 0.2;
    }

    ${HoverActionsAreaOverlay} {
      visibility: visible;
      opacity: 1;
      ${HideMetaDataOnToolTipDisplay} {
        visibility: visible;
      }
    }
  }
`;
