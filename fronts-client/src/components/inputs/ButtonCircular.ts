import { styled } from 'constants/theme';
import ButtonDefault from './ButtonDefault';

export default styled(ButtonDefault)`
	outline: transparent;
	padding: 0;
	height: 24px;
	width: 24px;
	font-size: 14px;
	font-weight: bold;
	border-radius: 24px;
	&:hover,
	&:active {
		outline: transparent;
	}
`;
