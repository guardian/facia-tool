import { styled } from 'constants/theme';

export default styled.div<{ direction?: 'column' | 'row' }>`
	display: flex;
	border-right: ${({ theme }) => `solid 1px ${theme.base.colors.borderColor}`};
	flex-direction: ${({ direction = 'row' }) => direction};
	padding: 10px;
	flex: 1;
	align-self: start;
	min-height: 100%;
	height: calc(100% - 60px);
	min-height: calc(100% - 60px);
`;
