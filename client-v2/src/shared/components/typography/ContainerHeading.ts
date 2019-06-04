import { styled } from 'shared/constants/theme';

const ContainerHeading = styled('div')`
  display: flex;
  font-family: GHGuardianHeadline;
  font-weight: bold;
  font-size: 22px;
  color: ${({ theme }) => theme.shared.base.colors.text};
`;

export default ContainerHeading;
