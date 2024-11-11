import React from 'react';
import { styled } from 'constants/theme';
import ButtonCircular from './ButtonCircular';
import { DownCaretIcon } from '../icons/Icons';
import { theme } from 'constants/theme';

export const ButtonCircularWithTransition = styled(ButtonCircular)<{
	highlight?: boolean;
	small?: boolean;
	clear?: boolean;
}>`
	transition: transform 0.15s;
	display: inline-block;
	vertical-align: middle;
	text-align: center;
	padding: 0;
	height: ${({ small }) => (small ? '18px' : undefined)};
	width: ${({ small }) => (small ? '18px' : undefined)};
	${({ clear }) => clear && 'background-color: transparent'}
	${({ highlight, clear }) =>
		highlight && !clear
			? `background-color: ${theme.button.backgroundColorHighlight}`
			: ``};
	${({ clear }) =>
		clear &&
		`
    & svg { fill: ${theme.base.colors.text} }
    &:hover {
      background-color: transparent;
      svg {
        fill: ${theme.base.colors.textMuted}
      }
    }`}
`;

const CaretIcon = styled(DownCaretIcon)<{
	small?: boolean;
	fill?: string;
}>`
	width: ${({ small }) => (small ? '14px' : '18px')};
	display: inline-block;
`;

type Directions = 'up' | 'right' | 'down' | 'left';

interface ButtonCircularCaretWithTransitionProps {
	active?: boolean;
	preActive?: boolean;
	small?: boolean;
	openDir?: Directions;
	disabled?: boolean;
	clear?: boolean;
	type?: 'submit' | 'reset' | 'button';
}

const getBaseRotation = (openDir: Directions) => {
	switch (openDir) {
		case 'down': {
			return 0;
		}
		case 'right': {
			return -90;
		}
		case 'up': {
			return -180;
		}
		case 'left': {
			return -270;
		}
	}
};

const getRotation = (
	openDir: Directions,
	active: boolean,
	preActive: boolean,
) => {
	const baseRotation = getBaseRotation(openDir);
	const activeRotation = active ? baseRotation + 180 : baseRotation;
	return preActive ? activeRotation + 45 : activeRotation;
};

export default ({
	active = false,
	preActive = false,
	small,
	clear,
	type,
	openDir = 'down',
	...props
}: ButtonCircularCaretWithTransitionProps &
	React.HTMLAttributes<HTMLButtonElement>) => (
	<ButtonCircularWithTransition
		{...props}
		small={small}
		clear={clear}
		highlight={preActive}
		type={type}
		style={{
			transform: `rotate(${getRotation(openDir, active, preActive)}deg)`,
			...props.style,
		}}
	>
		<CaretIcon small={small} fill={clear ? undefined : theme.colors.white} />
	</ButtonCircularWithTransition>
);
