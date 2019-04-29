import { styled } from '../../constants/theme';

export default styled('div')`
  display: flex;
  position: relative;
  font-family: TS3TextSans;
  font-size: 12px;
  font-weight: normal;
  justify-content: space-between;
  border-top: ${({ theme }) =>
    `1px solid ${theme.shared.base.colors.borderColor}`};
  cursor: pointer;
`;
