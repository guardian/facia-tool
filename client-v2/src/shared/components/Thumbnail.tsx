import styled from 'styled-components';

export default styled('div')`
  width: 130px;
  height: 83px;
  background-size: cover;
  background-color: ${({ theme }) => theme.base.colors.backgroundColorFocused};
`;
