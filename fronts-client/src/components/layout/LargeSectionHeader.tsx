import { styled, theme } from 'constants/theme';

export default styled.div`
	height: 60px;
	padding: 10px;
	font-size: 28px;
	line-height: ${theme.layout.sectionHeaderHeight}px;
	color: ${theme.base.colors.textLight};
	font-family: GHGuardianHeadline;
	font-weight: bold;
`;
