import React from 'react';
import { styled, theme } from 'constants/theme';
import { SectionHeaderUnpadded } from './SectionHeader';
import { Link } from 'react-router-dom';

const SectionHeader = styled(SectionHeaderUnpadded)`
	display: flex;
`;

const LogoTypeContainer = styled(Link)`
	background-color: ${theme.colors.blackDark};
	display: inline-block;
	text-align: center;
	height: 60px;
	width: 60px;
	line-height: 60px;
	color: white;
	text-decoration: none;
`;

export default ({
	children,
	includeBorder,
	greyHeader,
}: {
	children?: React.ReactNode;
	includeBorder?: boolean;
	greyHeader?: boolean;
}) => (
	<SectionHeader greyHeader={greyHeader} includeBorder={includeBorder}>
		<LogoTypeContainer to="/">F</LogoTypeContainer>
		{children}
	</SectionHeader>
);
