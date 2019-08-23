import { styled } from 'shared/constants/theme';
import { CollectionItemSizes } from 'shared/types/Collection';

export default styled.div<{
  size: CollectionItemSizes;
}>`
  ${({ size }) => size === 'small' && 'width: 100%;'}
  padding: 0 0 0 4px;
`;
