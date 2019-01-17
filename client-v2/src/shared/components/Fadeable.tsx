import styled from 'styled-components';

export default styled('div')<{
  fade?: boolean;
}>`
  opacity: ${({ fade }) => (fade ? 0.5 : 1)};
`;
