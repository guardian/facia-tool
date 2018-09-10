// @flow

import styled from 'styled-components';

const Row = styled('div')`
  display: flex;
  margin: 0 ${({ gutter = 10 }) => `${-(gutter / 2)}px`};
`;

export default Row;
