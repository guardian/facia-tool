import { styled } from '../../constants/theme';
import { theme } from 'constants/theme';

export const contentContainerMargin = '10px';

export default styled.div<{
	setBack?: boolean;
	topBorder?: boolean;
}>`
	background-color: ${({ setBack }) =>
		setBack ? 'transparent' : theme.base.colors.backgroundColor};
	position: relative;
	padding: 0 ${contentContainerMargin} ${contentContainerMargin}
		${contentContainerMargin};
	${({ topBorder = true }) =>
		topBorder && `box-shadow: 0 -1px 0 ${theme.base.colors.text}`};
	box-shadow: ${`0 -1px 0 ${theme.base.colors.text}`};
	border: ${({ setBack }) =>
		setBack ? 'none' : `1px solid ${theme.base.colors.borderColor}`};
	border-top: none;
	& + & {
		margin-top: 10px;
	}
`;
