import ContainerHeading from './ContainerHeading';
import { styled } from 'shared/constants/theme';

export default styled(ContainerHeading)`
  align-items: center;
  border-bottom: ${({ theme }) =>
    `1px solid ${theme.shared.base.colors.borderColor}`};
  height: 40px;
  line-height: 40px;
  vertical-align: middle;
  justify-content: space-between;
`;
