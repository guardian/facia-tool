import urlConstants from '../constants/url';

const stripQueryParams = (url: string): string => {
	const u = new URL(url);
	u.search = '';
	return u.toString();
};

const extractAtomId = (src: string | undefined): string => {
	// TODO: Handle CODE / PROD
	// TODO: Cleaner extraction
	if (src === undefined) {
		return '';
	}

	if (
		src.includes(urlConstants.media.videoBaseUrl) &&
		src.includes('/videos/')
	) {
		return src.split('/videos/')[1] || '';
	}

	if (src.includes(urlConstants.base.capi) && src.includes('/atom/video/')) {
		return stripQueryParams(src).split('/atom/video/')[1] || '';
	}

	return '';
};

const extractAssetId = (atom: any): string | undefined => {
	const assets = atom?.data?.media?.assets;
	if (
		assets === undefined ||
		assets.length === 0 ||
		assets[0] === undefined ||
		assets[0].id === undefined
	) {
		throw new Error(`No assets found for atom ${atom.id}`);
	} else {
		return assets[0].id;
	}
};

const extractVideoTrailImage = (atom: any): string | undefined => {
	const imageAssets = atom?.data?.media?.trailImage?.assets;

	if (
		imageAssets === undefined ||
		imageAssets.length === 0 ||
		imageAssets[0] === undefined ||
		imageAssets[0].file === undefined
	) {
		console.error(`No trail image found for atom ${atom.id}`);
		return undefined;
	} else {
		return imageAssets[0].file;
	}
};

const extractPlatform = (atom: any): Platform | undefined => {
	const mediaAssets = atom?.data?.media?.assets;

	if (
		mediaAssets === undefined ||
		mediaAssets.length === 0 ||
		mediaAssets[0] === undefined ||
		mediaAssets[0].platform === undefined
	) {
		console.error(`No media assets found for atom ${atom.id}`);
		return undefined;
	} else {
		return mediaAssets[0].platform;
	}
};

export type Platform = 'youtube' | 'url';

export type AtomProperties = {
	assetId: string | undefined;
	trailImage: string | undefined;
	platform: Platform | undefined;
};

const getVideoUri = (atomProperties: AtomProperties | undefined) => {
	if (atomProperties === undefined) {
		return undefined;
	}

	return atomProperties?.platform === 'youtube'
		? `https://www.youtube.com/embed/${atomProperties.assetId}`
		: atomProperties?.assetId;
};

const extractAtomProperties = (atom: any): AtomProperties => {
	if (atom === undefined) {
		return {
			assetId: undefined,
			trailImage: undefined,
			platform: undefined,
		};
	}

	const assetId = extractAssetId(atom);
	const trailImage = extractVideoTrailImage(atom);
	const platform = extractPlatform(atom);

	return {
		assetId,
		trailImage,
		platform,
	};
};

export { extractAtomId, extractAtomProperties, getVideoUri };
