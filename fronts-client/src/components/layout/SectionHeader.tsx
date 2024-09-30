import { styled } from '../../constants/theme';
import LargeSectionHeader from './LargeSectionHeader';

const SectionHeader = styled(LargeSectionHeader)<{
	includeBorder?: boolean;
	greyHeader?: boolean;
}>`
	border-right: ${({ theme, includeBorder }) =>
		`solid 1px ${includeBorder ? theme.colors.whiteDark : 'transparent'}`};
	background-color: ${({ theme, greyHeader }) =>
		greyHeader ? theme.colors.greyVeryLight : theme.colors.blackDark};
`;

const SectionHeaderUnpadded = styled(SectionHeader)`
	padding: 0;
`;

export { SectionHeaderUnpadded };

export default SectionHeader;
