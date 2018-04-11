import styled from 'styled-components';

const Row = styled('div')`
  display: flex;
  margin: ${({ gutter = 16 }) => `0 -${gutter / 2}px`};
`;

export default Row;
