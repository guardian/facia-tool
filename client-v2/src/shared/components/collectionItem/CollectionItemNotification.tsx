import styled from 'styled-components';

export default styled('div')`
  padding-left: 8px;
  bottom: 0;
  opacity: 1;
  position: absolute;
  right: 0;
  color: ${({ theme }) => theme.base.colors.textDark};
  font-size: 12px;
  font-weight: bold;
  background-color: ${({ theme }) => theme.base.colors.backgroundColor};
`;
