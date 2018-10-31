import styled from 'styled-components';
import BasePlaceholder from './ImagePlaceholder';

export default styled(BasePlaceholder)<{ width?: number }>`
  width: ${({ width }) => (width ? `${width}px` : '100%')}
  height: 0.7em;
  margin: 6px 0;
`;
