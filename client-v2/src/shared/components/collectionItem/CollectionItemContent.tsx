import styled from 'styled-components';
import { CollectionItemSizes } from 'shared/types/Collection';

const CollectionItemContent = styled('div')<{
  displaySize?: CollectionItemSizes;
}>`
  position: relative;
  padding: 0 8px;
  flex-basis: 100%;
  hyphens: auto;
  word-break: break-word;
`;

export default CollectionItemContent;
