import styled, { css } from 'styled-components';
import {
  CollectionItemDisplayTypes,
  CollectionItemSizes
} from 'shared/types/Collection';

const CollectionItemContent = styled('div')<{
  displayType?: CollectionItemDisplayTypes;
  displaySize?: CollectionItemSizes;
}>`
  position: relative;
  ${({ displayType, displaySize }) => {
    if (displayType === 'default') {
      if (displaySize !== 'small') {
        return css`
          width: calc(100% - 210px);
          padding: 0 8px;
        `;
      }
      return css`
        width: calc(100% - 100px);
        padding: 0 8px;
      `;
    }
  }};
`;

CollectionItemContent.defaultProps = {
  displayType: 'default'
};

export default CollectionItemContent;
