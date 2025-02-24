import { CapiArticle } from 'types/Capi';
import { Diff } from 'utility-types';
import type { DisplayHints, FrontsToolSettings } from 'types/FaciaApi';
import { CardTypes } from 'constants/cardTypes';

interface CollectionArticles {
	draft: CapiArticle[];
	live: CapiArticle[];
}

interface AlsoOnDetail {
	priorities: string[];
	fronts: Array<{ id: string; priority: string }>;
	meritsWarning: boolean;
}

interface Group {
	id: string | null;
	name: string | null;
	uuid: string;
	cards: string[];
}

interface GroupConfig {
	name: string;
	maxItems: number | null;
}

/** CardSets represent all of the lists of cards available in a collection. */
type CardSets = 'draft' | 'live' | 'previously';
/** Stages represent only those lists which are curated by the user.*/
type Stages = 'draft' | 'live';
type CardSizes = 'wide' | 'default' | 'medium' | 'small';
/** BoostLevels defines the string literals which represents each of the four levels
 * introduced by the new flexible containers. */
type BoostLevels = 'default' | 'boost' | 'megaboost' | 'gigaboost';

interface NestedCardRootFields {
	id: string;
	cardType?: CardTypes;
	frontPublicationDate: number;
	publishedBy?: string;
}

type NestedCard = NestedCardRootFields & {
	meta: {
		supporting?: Array<Diff<NestedCard, { supporting: unknown }>>;
		group?: string | null;
	};
};

type CardRootMeta = ChefCardMeta &
	FeastCollectionCardMeta & {
		group?: string;
		headline?: string;
		trailText?: string;
		byline?: string;
		sportScore?: string;
		customKicker?: string;
		href?: string;
		imageSrc?: string;
		imageSrcThumb?: string;
		imageSrcWidth?: string;
		imageSrcHeight?: string;
		imageSrcOrigin?: string;
		imageCutoutSrc?: string;
		imageCutoutSrcWidth?: string;
		imageCutoutSrcHeight?: string;
		imageCutoutSrcOrigin?: string;
		isBreaking?: boolean;
		/** For dynamic collections only */
		isBoosted?: boolean;
		/** For flexible collections only */
		boostLevel?: BoostLevels;
		showLivePlayable?: boolean;
		showMainVideo?: boolean;
		showLargeHeadline?: boolean;
		showQuotedHeadline?: boolean;
		showByline?: boolean;
		imageCutoutReplace?: boolean;
		imageReplace?: boolean;
		imageHide?: boolean;
		showKickerTag?: boolean;
		showKickerSection?: boolean;
		showKickerCustom?: boolean;
		snapUri?: string;
		snapType?: string;
		snapCss?: string;
		atomId?: string;
		imageSlideshowReplace?: boolean;
		slideshow?: Array<{
			src?: string;
			thumb?: string;
			width?: string;
			height?: string;
			origin?: string;
		}>;
		overrideArticleMainMedia?: boolean;
		coverCardImageReplace?: boolean;
		coverCardMobileImage?: ImageData;
		coverCardTabletImage?: ImageData;
	};

type CardRootFields = NestedCardRootFields & {
	uuid: string;
};

type CardMeta = CardRootMeta & {
	supporting?: string[];
};

export interface ImageData {
	src?: string;
	width?: number;
	height?: number;
	origin?: string;
	thumb?: string;
	caption?: string;
}

export interface Palette {
	foregroundHex: string;
	backgroundHex: string;
}

interface ChefCardMeta {
	bio?: string;
	chefTheme?: {
		id: string;
		palette: Palette;
	};
	chefImageOverride?: ImageData;
}

export interface FeastCollectionCardMeta {
	title?: string;
	feastCollectionTheme?: {
		id: string;
		lightPalette: Omit<Palette, 'id'>;
		darkPalette: Omit<Palette, 'id'>;
		imageURL?: string;
	};
}

interface Card extends CardRootFields {
	meta: CardMeta;
}

interface CardMetaDenormalised extends CardRootMeta {
	supporting?: CardDenormalised[];
}

interface CardDenormalised extends CardRootFields {
	meta: CardMetaDenormalised;
}

interface CollectionFromResponse {
	live: NestedCard[];
	previously?: NestedCard[];
	draft?: NestedCard[];
	isHidden?: boolean;
	lastUpdated?: number;
	updatedBy?: string;
	updatedEmail?: string;
	platform?: string;
	displayName: string;
	groups?: string[];
	metadata?: Array<{ type: string }>;
	uneditable?: boolean;
	targetedTerritory?: string;
	targetedRegions: string[];
	excludedRegions: string[];
}

type CollectionWithNestedArticles = CollectionFromResponse & {
	id: string;
};

// previouslyCardIds is stored in a separate key to avoid losing ordering information during normalisation.
interface Collection {
	live?: string[];
	previously?: string[];
	previouslyCardIds?: string[]; // this contains ids for deleted articles on a collection
	draft?: string[];
	id: string;
	lastUpdated?: number;
	updatedBy?: string;
	updatedEmail?: string;
	platform?: string;
	displayName: string;
	groupsConfig?: GroupConfig[];
	metadata?: Array<{ type: string }>;
	uneditable?: boolean;
	type?: string;
	frontsToolSettings?: FrontsToolSettings;
	isHidden?: boolean;
	targetedTerritory?: string;
	targetedRegions: string[];
	excludedRegions: string[];
	displayHints?: DisplayHints;
}

interface ArticleTag {
	webTitle?: string;
	sectionName?: string;
}

export {
	CollectionArticles,
	AlsoOnDetail,
	NestedCard,
	Card,
	CardDenormalised,
	CardRootFields,
	CardMeta,
	CollectionWithNestedArticles,
	CollectionFromResponse,
	Collection,
	CardSizes,
	Group,
	GroupConfig,
	Stages,
	CardSets,
	ArticleTag,
	ChefCardMeta,
	BoostLevels,
};
