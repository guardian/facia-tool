import { styled, theme } from 'constants/theme';
import { keyframes } from 'styled-components';

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const fadeInDelayed = keyframes`
  from {
    opacity: 0;
  }

  50% {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const Spinner = styled.div`
	animation:
		${rotate360} 1s linear infinite,
		${fadeInDelayed} 0.6s;
	transform: translateZ(0);
	border-top: 2px solid ${theme.colors.greyVeryLight};
	border-right: 2px solid ${theme.colors.greyVeryLight};
	border-bottom: 2px solid ${theme.colors.greyVeryLight};
	border-left: 2px solid ${theme.base.colors.text};
	background: transparent;
	width: 24px;
	height: 24px;
	border-radius: 50%;
`;

export default Spinner;
