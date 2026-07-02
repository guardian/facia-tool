interface ImageAsset {
	type: 'image';
	mimeType?: string;
	file: string;
	typeData: {
		width?: string;
		[id: string]: unknown;
	};
	dimensions?: {
		width: number;
		height: number;
	};
}

interface Element {
	id: string;
	relation: string;
	type: 'image' | 'video' | unknown;
	assets: ImageAsset[];
	contentAtomTypeData?: {
		atomId: string;
		atomType: string;
	};
}

type CapiDate = string;

interface User {
	email: string;
	firstName?: string;
	lastName?: string;
}

interface Block {
	id: string;
	bodyHtml: string;
	bodyTextSummary: string;
	title?: string;
	attributes: any[];
	published: boolean;
	createdDate?: CapiDate;
	firstPublishedDate?: CapiDate;
	publishedDate?: CapiDate;
	lastModifiedDate?: CapiDate;
	contributors: string[];
	createdBy?: User;
	lastModifiedBy?: User;
	elements: Element[];
}

interface Atoms {
	media: Atom[];
}

interface AtomResponse {
	media: Atom;
	status: string;
	total: number;
	userTier: string;
}

interface Atom {
	id: string;
	atomType: string;
	data: AtomData;
}

interface AtomData {
	media: MediaAtom;
}

interface ImageAssets {
	assets: ImageAsset[];
	master?: ImageAsset;
}

interface SelfHostData {
	videoPlayerFormat?: VideoPlayerFormat;
}

interface MediaAtomMetadata {
	selfHost?: SelfHostData;
}

interface MediaAtom {
	assets: AtomAsset[];
	trailImage?: ImageAssets;
	posterImage?: ImageAssets;
	activeVersion?: number;
	platform?: Platform;
	metadata?: MediaAtomMetadata;
}

type VideoPlayerFormat = 'loop' | 'cinemagraph' | 'default';

type Platform = 'youtube' | 'url';

type AssetType = 'video' | 'subtitles' | 'audio';

interface AtomAsset {
	assetType: AssetType;
	version: number;
	id: string;
	platform: Platform;
	mimeType?: string;
}

type YoutubeAtomProperties = {
	platform: 'youtube';
	videoImage?: string;
	youtube: AtomAsset;
};

type SelfHostedAtomProperties = {
	platform: 'url';
	videoImage?: string;
	videoPlayerFormat?: VideoPlayerFormat;
	url: {
		m3u8?: AtomAsset;
		mp4?: AtomAsset;
		vtt?: AtomAsset;
	};
};

type AtomProperties = SelfHostedAtomProperties | YoutubeAtomProperties;

interface Blocks {
	main?: Block;
	body?: Block[];
}

interface Tag {
	id: string;
	type: string;
	webTitle: string;
	webUrl: string;
	bylineImageUrl?: string;
	bylineLargeImageUrl?: string;
	sectionId?: string;
	sectionName?: string;
	bio?: string;
}

type CapiBool = 'true' | 'false' | boolean;

interface CapiArticleFields {
	newspaperPageNumber?: number;
	headline?: string;
	standfirst?: string;
	trailText?: string;
	byline?: string;
	internalPageCode?: string;
	isLive?: CapiBool;
	firstPublicationDate?: CapiDate;
	scheduledPublicationDate?: CapiDate;
	lastModified?: CapiDate;
	secureThumbnail?: string;
	thumbnail?: string | void;
	liveBloggingNow?: CapiBool;
	shortUrl?: string;
	membershipUrl?: string;
}

// See https://github.com/guardian/content-api-models/blob/master/models/src/main/thrift/content/v1.thrift#L1431
// for the canonical thrift definition.
interface CapiArticle {
	id: string;
	type: string;
	webTitle: string;
	webUrl: string;
	urlPath: string;
	webPublicationDate?: string;
	elements: Element[];
	pillarId?: string;
	pillarName?: string;
	sectionId: string;
	sectionName: string;
	fields: CapiArticleFields;
	tags?: Tag[];
	blocks: Blocks;
	atoms?: Atoms;
	isHosted?: boolean;
	frontsMeta: {
		defaults: {
			imageCutoutReplace: boolean;
			imageHide: boolean;
			imageReplace: boolean;
			imageSlideshowReplace: boolean;
			isBoosted: boolean;
			isBreaking: boolean;
			showLargeHeadline: boolean;
			showByline: boolean;
			showKickerCustom: boolean;
			showKickerSection: boolean;
			showKickerTag: boolean;
			showLivePlayable: boolean;
			showMainVideo: boolean;
			showQuotedHeadline: boolean;
		};
		tone?: string;
		cutout?: string;
		pickedKicker?: string;
	};
}

type CapiArticleWithMetadata = CapiArticle & { group?: number };

// The atom types the feed search supports adding to a front. All of these are
// stored generically as snaps (the snapType/atomId are derived from the atomType),
// so they share a single shape here rather than one interface per type.
const supportedAtomTypes = [
	'interactive',
	'qanda',
	'guide',
	'profile',
	'timeline',
	'audio',
	'explainer',
	'cta',
] as const;

type SupportedAtomType = (typeof supportedAtomTypes)[number];

interface CapiAtom {
	id: string;
	atomType: SupportedAtomType;
	// Some atom types carry their title at the top level of the atom (e.g. qanda,
	// guide, profile, timeline, cta, audio) while others nest it under
	// `data.<atomType>.title` (e.g. interactive, explainer). See `getAtomTitle`.
	title?: string;
	data?: {
		[K in SupportedAtomType]?: {
			title?: string;
		};
	};
	contentChangeDetails: {
		lastModified?: {
			date: number; // datetime in milliseconds
		};
	};
}

function isCapiAtom(item: CapiArticle | CapiAtom): item is CapiAtom {
	return supportedAtomTypes.includes(
		(item as CapiAtom).atomType as SupportedAtomType,
	);
}

// Resolve a display title for an atom regardless of where the title lives.
function getAtomTitle(atom: CapiAtom): string {
	return atom.data?.[atom.atomType]?.title ?? atom.title ?? atom.id;
}

export {
	CapiArticle,
	CapiArticleFields,
	CapiArticleWithMetadata,
	CapiAtom,
	SupportedAtomType,
	supportedAtomTypes,
	isCapiAtom,
	getAtomTitle,
	Tag,
	Element,
	Atom,
	AtomResponse,
	AtomAsset,
	AtomProperties,
	ImageAsset,
	Platform,
	AssetType,
};
