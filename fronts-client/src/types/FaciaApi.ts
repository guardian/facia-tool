import { $Diff } from 'utility-types';
import {
	CollectionFromResponse,
	GroupConfig,
	NestedCard,
} from 'types/Collection';
import { EditionsPrefill } from './Edition';

interface FrontConfigResponse {
	collections: string[];
	priority?: string;
	displayName?: string;
	index?: number;
	canonical?: string;
	group?: string;
	isHidden?: boolean;
	isImageDisplayed?: boolean;
	imageHeight?: number;
	imageWidth?: number;
	imageUrl?: string;
	onPageDescription?: string;
	description?: string;
	title?: string;
	webTitle?: string;
	navSection?: string;
	isSpecial?: boolean;
	metadata?: EditionsFrontMetadata;
}

interface EditionsFrontMetadata {
	nameOverride?: string;
}

type Platform = 'Web' | 'Platform';

interface FrontsToolSettings {
	displayEditWarning?: boolean;
}

interface DisplayHints {
	maxItemsToDisplay?: number;
	suppressImages?: boolean;
}

interface CollectionConfigResponse {
	displayName: string;
	type?: string;
	backfill?: unknown;
	href?: string;
	groups?: string[];
	groupsConfig?: GroupConfig[];
	metadata?: unknown[];
	uneditable?: boolean;
	showTags?: boolean;
	hideKickers?: boolean;
	excludedFromRss?: boolean;
	description?: string;
	showSections?: boolean;
	showDateHeader?: boolean;
	showLatestUpdate?: boolean;
	excludeFromRss?: boolean;
	hideShowMore?: boolean;
	platform?: Platform;
	frontsToolSettings?: FrontsToolSettings;
	prefill?: EditionsPrefill;
	targetedTerritory?: string;
	displayHints?: DisplayHints;
}

interface FrontsConfigResponse {
	fronts: {
		[id: string]: FrontConfigResponse;
	};
	collections: {
		[id: string]: CollectionConfigResponse;
	};
}

type FrontConfig = $Diff<FrontConfigResponse, { priority?: string | void }> & {
	id: string;
	priority: string;
};

type CollectionConfig = CollectionConfigResponse & {
	id: string;
};

interface FrontConfigMap {
	[id: string]: FrontConfig;
}

interface CollectionConfigMap {
	[id: string]: CollectionConfig;
}

interface FrontsConfig {
	fronts: FrontConfigMap;
	collections: CollectionConfigMap;
}

interface ArticleDetails {
	group: number;
	isBoosted: boolean;
}

interface CollectionResponse {
	id: string;
	collection: CollectionFromResponse;
	storiesVisibleByStage: {
		live?: VisibleArticlesResponse;
		draft?: VisibleArticlesResponse;
	};
}

export interface EditionCollectionFromResponse {
	id: string;
	items: NestedCard[];
	lastUpdated?: number;
	updatedBy?: string;
	updatedEmail?: string;
	platform?: string;
	displayName: string;
	groups?: string[];
	groupsConfig?: GroupConfig[];
	metadata?: Array<{ type: string }>;
	uneditable?: boolean;
	isHidden?: boolean;
	targetedRegions?: string[];
	excludedRegions?: string[];
}

interface EditionCollectionResponse {
	id: string;
	collection: EditionCollectionFromResponse;
}

interface VisibleArticlesResponse {
	desktop: number;
	mobile: number;
}

export {
	FrontConfig,
	CollectionConfig,
	FrontsConfig,
	FrontsConfigResponse,
	FrontConfigMap,
	CollectionConfigMap,
	ArticleDetails,
	CollectionResponse,
	EditionCollectionResponse,
	VisibleArticlesResponse,
	FrontsToolSettings,
	DisplayHints,
	EditionsFrontMetadata,
};
