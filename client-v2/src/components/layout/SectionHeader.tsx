import { styled } from '../../constants/theme';
import LargeSectionHeader from './LargeSectionHeader';

const SectionHeader = styled(LargeSectionHeader)`
  background-color: ${({ theme }) => theme.shared.colors.blackLight};
  border-right: ${({ theme }) => `solid 1px ${theme.shared.colors.whiteDark}`};
`;

const SectionHeaderUnpadded = styled(SectionHeader)`
  padding: 0;
`;

export { SectionHeaderUnpadded };

export default SectionHeader;
