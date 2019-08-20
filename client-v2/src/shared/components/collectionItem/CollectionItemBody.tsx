import styled from 'styled-components';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';
import Thumbnail from '../image/Thumbnail';
import { CollectionItemSizes } from 'shared/types/Collection';
import { theme } from 'constants/theme';

export default styled('div')<{
  fade?: boolean;
  size?: CollectionItemSizes;
  tone?: string | void;
}>`
  position: relative;
  display: flex;
  border-top: 1px solid ${theme.shared.base.colors.text};
  min-height: ${({ size }) => (size === 'small' ? '25px' : '50px')};
  cursor: pointer;
  background-color: ${theme.shared.base.colors.backgroundColorLight};
  opacity: ${({ fade }) => (fade ? 0.5 : 1)};

  ${HoverActionsAreaOverlay} {
    bottom: 4px;
    left: 8px;
    position: absolute;
    visibility: hidden;
  }

  :hover {
    background-color: ${theme.shared.base.colors.backgroundColorFocused};

    ${HoverActionsAreaOverlay} {
      transition-delay: 0s;
      visibility: visible;
    }

    ${Thumbnail} {
      opacity: 0.4;
    }
  }
`;
