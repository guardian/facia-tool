import { styled } from '../../constants/theme';
import { CollectionItemSizes } from '../../types/Collection';

export default styled.div<{ size: CollectionItemSizes }>`
  display: flex;
  flex-direction: row;
  ${props =>
    props.size === 'medium' &&
    `flex-wrap: wrap-reverse;
  justify-content: flex-end;`}
`;
