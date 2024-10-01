import { styled } from 'constants/theme';

export default styled.label<{
	size?: 'sm';
	active?: boolean;
	hidden?: boolean;
	for?: string;
}>`
	display: ${(props) => (props.hidden ? 'none' : 'inline-block')};
	font-size: ${(props) =>
		props.size === 'sm'
			? props.theme.label.fontSizeSmall
			: props.theme.label.fontSize};
	line-height: ${(props) => props.theme.label.lineHeight};
	font-weight: bold;
	${(props) => !props.active && `color:`};
`;
