import { styled } from 'constants/theme';

export default styled.a.attrs({
	target: '_blank',
	rel: 'noopener noreferrer',
})`
	text-decoration: none;

	&:focus {
		outline: 1px solid ${(props) => props.theme.base.colors.focusColor};
	}
`;
