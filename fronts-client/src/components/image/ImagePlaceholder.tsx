import BasePlaceholder from '../BasePlaceholder';
import { styled } from 'constants/theme';

export default styled(BasePlaceholder)<{ width?: number; height?: number }>`
	width: ${({ width }) => (width ? `${width}px` : '100%')};
	height: ${({ height }) => (height ? `${height}px` : 'auto')};
	margin: 6px 0;
`;
