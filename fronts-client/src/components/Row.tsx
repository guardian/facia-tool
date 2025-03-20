import { styled } from 'constants/theme';

const Row = styled.div<{
	flexDirection?: string;
	gutter?: number;
	rowGap?: number;
}>`
	display: flex;
	margin: 0 ${({ gutter = 10 }: { gutter?: number }) => `${-(gutter / 2)}px`};
	flex-wrap: wrap;
	// row-gap used when wrapped
	row-gap: ${({ rowGap }: { rowGap?: number }) =>
		rowGap ? `${rowGap}px` : '0'};
	flex-direction: ${({ flexDirection }) =>
		flexDirection ? flexDirection : ''};
`;

export default Row;
