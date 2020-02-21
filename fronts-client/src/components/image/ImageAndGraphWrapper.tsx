import { styled } from '../../constants/theme';
import { CardSizes } from '../../shared/types/Collection';

export default styled.div<{ size: CardSizes }>`
  display: flex;
  flex-direction: row;
  ${props =>
    props.size === 'medium' &&
    `flex-wrap: wrap-reverse;
  justify-content: flex-end;`}
`;
