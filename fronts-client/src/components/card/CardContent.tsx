import styled from 'styled-components';
import { CardSizes } from 'types/Collection';
import { theme } from '../../constants/theme';

const CardContent = styled.div<{
	displaySize?: CardSizes;
	textSize?: CardSizes;
	isToShowError?: boolean;
}>`
	position: relative;
	min-width: 0;
	font-size: ${({ textSize, theme }) =>
		textSize === 'small'
			? theme.card.fontSizeSmall
			: theme.card.fontSizeDefault};
	flex-basis: 100%;
	hyphens: auto;
	word-break: break-word;
	p {
		margin: 0;
	}
	background-color: ${({ isToShowError }) =>
		isToShowError ? theme.colors.greyMediumLight : theme.colors.white};
	color: ${({ isToShowError }) =>
		isToShowError ? theme.colors.white : theme.colors.blackLight};
`;

export default CardContent;
