import styled from 'styled-components';

const Col = styled(`div`)`
  flex: ${({ flex = 1 }) => flex};
  padding: ${({ gutter = 16 }) => `${gutter / 2}px`};
`;

export default Col;
