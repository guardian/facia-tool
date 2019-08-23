import { styled, css } from 'shared/constants/theme';
import { DefaultDropIndicator } from 'components/DropZone';

export default styled.div<{ isDraggingArticleOver?: boolean }>`
  position: relative;
  ${({ isDraggingArticleOver }) =>
    isDraggingArticleOver &&
    css`
      ${DefaultDropIndicator} {
        opacity: 1;
      }
    `}
`;
