import styled from 'styled-components';
import { CollectionItemSizes } from 'shared/types/Collection';

const CollectionItemContent = styled.div<{
  displaySize?: CollectionItemSizes;
  textSize?: CollectionItemSizes;
}>`
  position: relative;
  min-width: 0;
  font-size: ${({ textSize, theme }) =>
    textSize === 'small'
      ? theme.shared.collectionItem.fontSizeSmall
      : theme.shared.collectionItem.fontSizeDefault};
  flex-basis: 100%;
  hyphens: auto;
  word-break: break-word;
`;

export default CollectionItemContent;
