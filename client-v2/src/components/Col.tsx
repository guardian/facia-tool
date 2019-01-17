import styled from 'styled-components';

const Col = styled(`div`)<{
  flex?: number;
  gutter?: number;
}>`
  flex: ${({ flex = 1 }) => flex};
  padding: 0 ${({ gutter = 10 }) => `${gutter / 2}px`};
`;

export default Col;
