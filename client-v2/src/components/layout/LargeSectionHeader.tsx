import { styled } from 'constants/theme';

export default styled('div')`
  height: 60px;
  padding: 10px;
  font-size: 28px;
  line-height: 40px;
  color: ${({ theme }) => theme.shared.base.colors.textLight};
  font-family: GHGuardianHeadline;
  font-weight: bold;
`;
