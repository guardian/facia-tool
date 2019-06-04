import styled from 'styled-components';
import {
  CollectionItemDisplayTypes,
  CollectionItemSizes
} from 'shared/types/Collection';

const CollectionItemContent = styled('div')<{
  displayType?: CollectionItemDisplayTypes;
  displaySize?: CollectionItemSizes;
}>`
  position: relative;
  padding: 0 8px;
  flex-basis: 100%;
  hyphens: auto;
  word-break: break-word;
`;

CollectionItemContent.defaultProps = {
  displayType: 'default'
};

export default CollectionItemContent;
