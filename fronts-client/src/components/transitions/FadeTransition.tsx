import React from 'react';
import { CSSTransition } from 'react-transition-group';
import { styled } from 'constants/theme';

type TransitionDirections = 'up' | 'right' | 'down' | 'left';

interface TransitionProps {
	duration?: number;
	length?: number;
	direction: TransitionDirections;
}

const transitionName = 'fade';

const directionMap = {
	up: (px: number) => `0, ${px}, 0`,
	right: (px: number) => `${px}px, 0, 0`,
	down: (px: number) => `0, ${-px}px, 0`,
	left: (px: number) => `${-px}px, 0, 0`,
};

const applyDirection = ({ direction, length = 15 }: TransitionProps) =>
	directionMap[direction](length);

const TransitionContainer = styled.div<TransitionProps>`
	display: contents;
	position: relative;
	&.${transitionName}-${({ direction }) => direction}-enter {
		opacity: 0.01;
		transform: translate3d(${applyDirection});
	}

	&.${transitionName}-${({ direction }) => direction}-enter-active {
		opacity: 1;
		transform: translate3d(0, 0, 0);
		transition:
			opacity ${({ duration = 150 }) => duration}ms ease-out,
			transform ${({ duration = 150 }) => duration}ms ease-out;
	}

	&.${transitionName}-${({ direction }) => direction}-exit {
		opacity: 1;
		transform: translate3d(0, 0, 0);
	}

	&.${transitionName}-${({ direction }) => direction}-exit-active {
		opacity: 0.01;
		transform: translate3d(${applyDirection});
		transition:
			opacity ${({ duration = 150 }) => duration}ms ease-out,
			transform ${({ duration = 150 }) => duration}ms ease-out;
	}
`;

const FadeTransition: React.StatelessComponent<
	TransitionProps & { active: boolean }
> = ({ direction, duration = 150, active, children }) => (
	<CSSTransition
		in={active}
		classNames={`${transitionName}-${direction}`}
		mountOnEnter
		unmountOnExit
		transitionName={`fade-${direction}`}
		timeout={duration}
	>
		<TransitionContainer duration={duration} direction={direction}>
			{children}
		</TransitionContainer>
	</CSSTransition>
);

export default FadeTransition;
