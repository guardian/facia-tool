import styled from 'styled-components';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';
import Thumbnail from 'components/image/Thumbnail';
import { CardSizes } from 'types/Collection';
import { theme } from 'constants/theme';

/**
 * Avoid rendering this section of the card when it's offscreen.
 *
 * Assumes a default card height that will be recalculated during layout
 * when the card becomes visible.
 */
const avoidCardOffscreenRender = `
  content-visibility: auto;
  contain-intrinsic-size: 65px;
`;

export default styled.div<{
  fade?: boolean;
  size?: CardSizes;
  tone?: string | void;
}>`
  ${avoidCardOffscreenRender}

  position: relative;
  display: flex;
  min-height: ${({ size }) => (size === 'small' ? '25px' : '50px')};
  cursor: pointer;
  background-color: ${theme.base.colors.backgroundColorLight};
  opacity: ${({ fade }) => (fade ? 0.5 : 1)};

  ${HoverActionsAreaOverlay} {
    bottom: 4px;
    left: 8px;
    position: absolute;
    visibility: hidden;
  }

  :hover {
    background-color: ${theme.base.colors.backgroundColorFocused};

    ${HoverActionsAreaOverlay} {
      transition-delay: 0s;
      visibility: visible;
    }

    ${Thumbnail} {
      opacity: 0.4;
    }
  }
`;
