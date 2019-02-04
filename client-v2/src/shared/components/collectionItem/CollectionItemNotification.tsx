import { styled } from 'shared/constants/theme';

export default styled('div')`
  padding-left: 8px;
  bottom: 0;
  opacity: 1;
  position: absolute;
  right: 0;
  color: ${({ theme }) => theme.shared.base.colors.textDark};
  font-size: 12px;
  font-weight: bold;
  background-color: ${({ theme }) => theme.shared.base.colors.backgroundColor};
`;
