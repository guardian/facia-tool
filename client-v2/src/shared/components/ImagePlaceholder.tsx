import BasePlaceholder from './BasePlaceholder';
import styled from 'styled-components';

export default styled(BasePlaceholder)<{ width?: number }>`
  width: ${({ width }) => (width ? `${width}px` : '100%')}
  height: 0.7rem;
  margin: 6px 0;
`;
