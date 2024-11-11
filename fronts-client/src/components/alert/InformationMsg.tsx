import { styled } from 'constants/theme';
import { theme } from 'constants/theme';

export default styled.div<{ status?: 'info' | 'error' }>`
	position: relative;
	max-width: 600px;
	margin: 10px 0;
	padding: 10px 10px 10px 15px;
	border: 1px solid ${theme.colors.greyVeryLight};
	border-left: none;
	&:before {
		content: ' ';
		position: absolute;
		top: -1px;
		left: 0;
		bottom: -1px;
		border-left: 4px solid
			${(props) => (props.status === 'info' ? 'green' : 'red')};
	}
`;
