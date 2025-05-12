import type { NestedCard } from 'types/Collection';
import type { FeatureSwitch } from './Features';
import type { EditionPriority } from '../types/Priority';

interface Permission {
	[id: string]: boolean;
}

interface Acl {
	fronts: Permission;
	editions: Permission;
	permissions: Permission;
}

interface Metadata {
	type: string;
}

interface BaseUrls {
	mediaBaseUrl: string;
	apiBaseUrl: string;
	videoBaseUrl: string;
}

interface Config {
	dev: boolean;
	env: string;
	editions: string[];
	email: string;
	avatarUrl?: string;
	firstName: string;
	lastName: string;
	sentryPublicDSN: string;
	switches: { [key: string]: boolean };
	acl: Acl;
	collectionCap: number;
	navListCap: number;
	navListType: string;
	collectionMetadata: Metadata[];
	capiLiveUrl: string;
	capiPreviewUrl: string;
	// frontIds is deprecated -- use frontIdsByPriority.
	userData?: {
		frontIds: string[];
		frontIdsByPriority: {
			[id: string]: string[];
		};
		favouriteFrontIdsByPriority: {
			[id: string]: string[];
		};
		clipboardArticles: NestedCard[];
		featureSwitches: FeatureSwitch[];
	};
	availableTemplates: EditionPriority[];
	telemetryUrl: string;
	baseUrls: BaseUrls;
}

export { Config };
