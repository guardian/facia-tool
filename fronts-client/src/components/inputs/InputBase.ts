import { styled } from 'constants/theme';

export default styled.input<{
	useHeadlineFont?: boolean;
}>`
	display: block;
	appearance: none;
	height: ${(props) => props.theme.input.height};
	padding: ${(props) => props.theme.input.paddingY}
		${(props) => props.theme.input.paddingX};
	font-size: ${(props) =>
		props.useHeadlineFont
			? props.theme.input.fontSizeHeadline
			: props.theme.input.fontSize};
	color: ${(props) => props.theme.input.color};
	background-color: ${(props) => props.theme.input.backgroundColor};
	border: 1px solid ${(props) => props.theme.input.borderColor};
	width: 100%;
	background-clip: padding-box;
	${(props) =>
		props.useHeadlineFont &&
		`font-family: GHGuardianHeadline; font-weight: 500`};
	::placeholder {
		color: ${(props) => props.theme.input.placeholderText};
	}
	:focus {
		outline: none;
		border: solid 1px ${(props) => props.theme.input.borderColorFocus};
	}
	:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;
