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
	color: ${theme.colors.white};
	text-decoration: none;
`;

const customNaviStyles = css`
	height: 62px;
	z-index: 1;
	width: 100%;
`;

const topBarColors = css`
	color: white;
	background: ${theme.colors.blackDark};
`;

const selectedBorder = css`
	border-bottom-color: ${theme.colors.orange};
`;

const faviconCustomTheme = {
	color: {
		background: theme.colors.greyDark,
		text: theme.colors.white,
	},
};

const navHoverBorder = css`
	&:hover {
		border-bottom-color: ${theme.colors.orange};
	}
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
			{!isSubnavPath && <LogoTypeContainer to="/">F</LogoTypeContainer>}
			{isSubnavPath && (
				<TopBar cssOverrides={[customNaviStyles, topBarColors]}>
					<TopBarToolName
						name="Fronts"
						favicon={{
							letter: 'F',
							theme: faviconCustomTheme,
						}}
						href="/v2"
						hoverText="Back to Fronts"
						collapsedHoverText="Back"
						subsection="Navi"
						subsectionIcon={'explore'}
						cssOverrides={[topBarColors]}
					></TopBarToolName>
					<TopBarContainerLeft>
						<TopBarNavigation
							text="All subnavs"
							href="/v2/subnavs"
							isSelected={!!isSubnavListPath}
							cssOverrides={[
								topBarColors,
								...(isSubnavListPath ? [selectedBorder] : []),
								navHoverBorder,
							]}
						/>
						<TopBarNavigation
							text="Create subnav"
							href="/v2/subnavs/new"
							isSelected={!!isSubnavCreatePath}
							cssOverrides={[
								topBarColors,
								...(isSubnavCreatePath ? [selectedBorder] : []),
								navHoverBorder,
							]}
						/>
					</TopBarContainerLeft>
				</TopBar>
			)}
			{children}
		</SectionHeader>
	);
};
