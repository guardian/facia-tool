import { styled } from 'constants/theme';

export default styled.div<{
	fade?: boolean;
}>`
	opacity: ${({ fade }) => (fade ? 0.5 : 1)};
`;
