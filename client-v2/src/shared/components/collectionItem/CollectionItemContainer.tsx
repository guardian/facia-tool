import { styled, css } from 'shared/constants/theme';
import { DropIndicator } from 'components/DropZone';

export default styled('div')<{ isDraggingArticleOver?: boolean }>`
  position: relative;
  ${({ isDraggingArticleOver }) =>
    isDraggingArticleOver &&
    css`
      ${DropIndicator} {
        opacity: 1;
      }
    `}
`;
