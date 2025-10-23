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

interface MediaAtom {
	assets: AtomAsset[];
	trailImage?: ImageAssets;
	posterImage?: ImageAssets;
	activeVersion?: number;
}

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

export {
	CapiArticle,
	CapiArticleFields,
	CapiArticleWithMetadata,
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
