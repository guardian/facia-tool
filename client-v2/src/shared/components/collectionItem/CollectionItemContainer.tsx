import { styled } from 'shared/constants/theme';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';

export default styled('div')`
  position: relative;
  ${HoverActionsAreaOverlay} {
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
  }
`;
