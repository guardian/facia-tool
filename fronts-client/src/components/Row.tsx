import { styled } from 'constants/theme';

const Row = styled.div<{ flexDirection?: string; gutter?: number }>`
	display: flex;
	margin: 0 ${({ gutter = 10 }: { gutter?: number }) => `${-(gutter / 2)}px`};
	flex-direction: ${({ flexDirection }) =>
		flexDirection ? flexDirection : ''};
`;

export default Row;
