import Col from 'components/Col';
import { styled } from 'constants/theme';

export const ImageCol = styled(Col)`
	flex: initial;
	flex-shrink: 0;
	transition: opacity 0.15s;
	opacity: ${(props: { faded?: boolean }) => (props.faded ? 0.6 : 1)};
`;
