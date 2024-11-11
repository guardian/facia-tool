import { styled, theme } from 'constants/theme';

export default styled.div`
	position: absolute;
	height: 10px;
	bottom: 0;
	left: 0;
	width: 100%;
	background-color: ${theme.colors.orange};
	pointer-events: none;
`;
