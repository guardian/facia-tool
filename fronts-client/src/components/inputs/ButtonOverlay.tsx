import React from 'react';
import { styled, theme } from 'constants/theme';
import { css } from 'styled-components';

import Button from 'components/inputs/ButtonDefault';

const ButtonWithShadow = styled(Button)<{ active?: boolean }>`
	box-shadow:
		rgba(0, 0, 0, 0.15) 0px 1px 10px 2px,
		rgba(255, 255, 255, 0.15) 0px 0px 2px 3px;
	width: 50px;
	height: 50px;
	padding: 5px;
	border-radius: 100%;
	background-color: ${theme.colors.blackDark};
	transition:
		transform 0.15s,
		background-color 0.15s;
	${({ active }) =>
		active &&
		css`
			transform: rotate(45deg);
			background-color: ${theme.button.backgroundColorHighlight};
			&:hover {
				background-color: ${theme.colors.orangeDark};
			}
		`};
`;

const ButtonOverlay = ({
	children,
	...rest
}: {
	children: React.ReactNode;
	active?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>) => (
	<ButtonWithShadow {...rest}>{children}</ButtonWithShadow>
);

export default ButtonOverlay;
