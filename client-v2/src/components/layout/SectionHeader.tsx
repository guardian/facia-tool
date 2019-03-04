import { styled } from '../../constants/theme';
import LargeSectionHeader from './LargeSectionHeader';

const SectionHeaderBase = styled(LargeSectionHeader)`
  border-right: ${({ theme }) => `solid 1px ${theme.shared.colors.whiteDark}`};
`;

const SectionHeader = styled(SectionHeaderBase)`
  background-color: ${({ theme }) => theme.shared.colors.blackLight};
`;

const SectionHeaderUnpadded = styled(SectionHeader)`
  padding: 0;
`;

const FrontSectionHeader = styled(SectionHeaderBase)`
  background-color: ${({ theme }) => theme.shared.colors.greyVeryLight};
`;

export { SectionHeaderUnpadded, FrontSectionHeader };

export default SectionHeader;
