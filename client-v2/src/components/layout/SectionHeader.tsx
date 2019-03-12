import { styled } from '../../constants/theme';
import LargeSectionHeader from './LargeSectionHeader';

const SectionHeaderBase = styled(LargeSectionHeader)<{
  includeBorder?: boolean;
}>`
  border-right: ${({ theme, includeBorder }) =>
    `solid 1px ${
      includeBorder ? theme.shared.colors.whiteDark : 'transparent'
    }`};
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
