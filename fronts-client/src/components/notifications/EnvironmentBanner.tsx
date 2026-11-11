import React from 'react';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { semanticColors } from '@guardian/stand';
import pageConfig from 'util/extractConfigFromPage';

const iconColours = {
	information: semanticColors.text.information,
	warning: semanticColors.text.warning,
	error: semanticColors.text.error,
};

const getEnvironment = () => {
	if (pageConfig.dev) {
		return { name: 'DEV', level: 'information' } as const;
	}
	if (pageConfig.env === 'code') {
		return { name: 'CODE', level: 'warning' } as const;
	}
	// The server only sets showProdWarning for engineers, so everyone else sees no banner in PROD.
	if (pageConfig.env === 'prod' && pageConfig.showProdWarning) {
		return { name: 'PROD', level: 'error' } as const;
	}
	return undefined;
};

const EnvironmentBanner = () => {
	const environment = getEnvironment();
	return environment ? (
		<AlertBanner
			level={environment.level}
			showIcon
			theme={{
				shared: {
					content: { icon: { color: iconColours[environment.level] } },
				},
			}}
		>
			You are working in the Fronts Tool {environment.name} Environment
		</AlertBanner>
	) : null;
};

export default EnvironmentBanner;
