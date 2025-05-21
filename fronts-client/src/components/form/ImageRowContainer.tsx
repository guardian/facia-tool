import { styled } from 'constants/theme';
import { RowContainer } from './RowContainer';

export const ImageRowContainer = styled(RowContainer)`
	flex: 1 1 auto;
	margin-left: ${(props: { size?: string }) =>
		props.size !== 'wide' ? 0 : '10px'};
	overflow: visible;
`;
