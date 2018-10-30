import styled, { css } from 'styled-components';
import { CollectionItemDisplayTypes } from 'shared/types/Collection';

const CollectionItemContent = styled('div')<{
  displayType?: CollectionItemDisplayTypes;
}>`
  position: relative;
  ${({ displayType }) =>
    displayType === 'default' &&
    css`
      width: calc(100% - 210px);
      padding: 0 8px;
    `};
`;

CollectionItemContent.defaultProps = {
  displayType: 'default'
};

export default CollectionItemContent;
