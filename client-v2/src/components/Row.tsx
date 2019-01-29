import { styled } from 'constants/theme';

const Row = styled('div')`
  display: flex;
  margin: 0 ${({ gutter = 10 }: { gutter?: number }) => `${-(gutter / 2)}px`};
`;

export default Row;
