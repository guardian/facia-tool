import { styled } from 'constants/theme';
import BasePlaceholder from 'components/image/ImagePlaceholder';

export default styled(BasePlaceholder)<{ width?: number }>`
	width: ${({ width }) => (width ? `${width}px` : '100%')};
	height: 0.7em;
	margin: 6px 0;
`;
