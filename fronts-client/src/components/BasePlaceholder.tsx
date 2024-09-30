import styled, { createGlobalStyle } from 'styled-components';

export const PlaceholderAnimation = createGlobalStyle`
  @keyframes phAnimation {
    0% {
      transform: translate3d(-30%, 0, 0);
    }
    100% {
      transform: translate3d(30%, 0, 0);
    }
  }
`;

export default styled.div`
	background-color: ${({ theme }) => theme.base.colors.backgroundColorFocused};
	position: relative;
	overflow: hidden;

	&::before {
		content: ' ';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 50%;
		z-index: 1;
		width: 500%;
		margin-left: -250%;
		animation: phAnimation 1.2s linear infinite;
		background: linear-gradient(
				to right,
				rgba(255, 255, 255, 0) 46%,
				rgba(255, 255, 255, 0.35) 50%,
				rgba(255, 255, 255, 0) 54%
			)
			50% 50%;
	}
`;
