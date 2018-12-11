import styled from 'styled-components';

export default styled('div')<{ isUneditable?: boolean }>`
  pointer-events: ${({ isUneditable }) => (isUneditable ? 'none' : 'auto')};
  position: 'relative';
`;
