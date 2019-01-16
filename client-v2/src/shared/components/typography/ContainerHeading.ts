import { styled } from 'shared/constants/theme';

const ContainerHeading = styled('div')`
  display: flex;
  font-family: GHGuardianHeadline-Bold;
  font-size: 22px;
  line-height: 22px;
  font-weight: bold;
  font-style: normal;
  color: ${({ theme }) => theme.base.colors.text};
`;

export default ContainerHeading;
