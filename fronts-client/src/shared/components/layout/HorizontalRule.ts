import { styled } from 'constants/theme-shared';

export default styled.div<{ noMargin?: boolean }>`
  width: 100%;
  height: 1px;
  border-top: ${({ theme }) =>
    `1px solid ${theme.shared.base.colors.borderColor}`};
  margin: ${props => (props.noMargin ? '0' : '6px')} 0;
`;
