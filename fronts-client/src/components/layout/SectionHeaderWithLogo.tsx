import React from 'react';
import { css } from '@emotion/react';
import { styled, theme } from 'constants/theme';
import { SectionHeaderUnpadded } from './SectionHeader';
import { Link } from 'react-router-dom';
import { useRouteMatch } from 'react-router';
import { subnavRoutes } from 'routes/routes';
import {
	TopBar,
	TopBarContainerLeft,
	TopBarNavigation,
} from '@guardian/stand/TopBar';
import { TopBarToolName } from '@guardian/stand/TopBar';

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

const customNaviStyles = css`
	height: 60px;
	z-index: 1;
`;

export default ({
	children,
	includeBorder,
	greyHeader,
}: {
	children?: React.ReactNode;
	includeBorder?: boolean;
	greyHeader?: boolean;
}) => {
	const isSubnavPath = useRouteMatch(subnavRoutes.sectionProps);
	const isSubnavListPath = useRouteMatch(subnavRoutes.listProps);
	const isSubnavCreatePath = useRouteMatch(subnavRoutes.createProps);
	return (
		<SectionHeader greyHeader={greyHeader} includeBorder={includeBorder}>
			<LogoTypeContainer to="/">F</LogoTypeContainer>
			{isSubnavPath && (
				<TopBar cssOverrides={customNaviStyles}>
					<TopBarToolName
						name="Navi"
						favicon={{ letter: 'N' }}
						href="/v2/subnavs"
					></TopBarToolName>
					<TopBarContainerLeft>
						<TopBarNavigation
							text="All subnavs"
							href="/v2/subnavs"
							isSelected={!!isSubnavListPath}
						/>
						<TopBarNavigation
							text="Create subnav"
							href="/v2/subnavs/new"
							isSelected={!!isSubnavCreatePath}
						/>
					</TopBarContainerLeft>
				</TopBar>
			)}
			{children}
		</SectionHeader>
	);
};
