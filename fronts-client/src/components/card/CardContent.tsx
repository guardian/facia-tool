import styled from 'styled-components';
import { CardSizes } from 'shared/types/Collection';

const CardContent = styled.div<{
  displaySize?: CardSizes;
  textSize?: CardSizes;
}>`
  position: relative;
  min-width: 0;
  font-size: ${({ textSize, theme }) =>
    textSize === 'small'
      ? theme.card.fontSizeSmall
      : theme.card.fontSizeDefault};
  flex-basis: 100%;
  hyphens: auto;
  word-break: break-word;
  p {
    margin: 0;
  }
`;

export default CardContent;
