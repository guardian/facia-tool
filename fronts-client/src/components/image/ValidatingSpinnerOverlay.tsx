import { styled, theme } from 'constants/theme';
import React from 'react';
import Spinner from '../async/Spinner';

const Overlay = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: ${theme.colors.blackTransparent20};
	pointer-events: none;
`;

export default () => (
	<Overlay>
		<Spinner />
	</Overlay>
);
