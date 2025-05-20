import urlConstants from '../constants/url';
import type { Atom, AtomAsset, ImageAsset, Platform } from '../types/Capi';

export const stripQueryParams = (value: string) => {
	const parts: string[] = value.split('?');
	return parts[0];
};

const attemptResourceExtract = (
	fullPath: string,
	baseUrl: string,
	resourcePath: string,
): string | undefined => {
	if (fullPath.includes(baseUrl) && fullPath.includes(resourcePath)) {
		const parts: string[] = fullPath.split(resourcePath);
		if (parts.length > 1) return parts[1];
	}

	return undefined;
};

const extractAtomId = (videoUri: string | undefined): string => {
	/*
	 * This method works for both PROD and CODE paths, irrespective of the stage of the Fronts Tool.
	 *
	 * We could choose to pass a stage parameter, but I think it's better to be flexible, given
	 * CODE Fronts Tool can be pointed to PROD or CODE CAPI.
	 */
	if (videoUri === undefined) return '';

	const cleanVideoUri = stripQueryParams(videoUri);

	const atomMakerAttempt = attemptResourceExtract(
		cleanVideoUri,
		urlConstants.video.videoBaseUrl,
		urlConstants.video.mediaAtomMakerPath,
	);
	if (atomMakerAttempt !== undefined)
		return `${urlConstants.video.capiMediaAtomPath}${atomMakerAttempt}`;

	const capiAttempt = attemptResourceExtract(
		cleanVideoUri,
		urlConstants.base.capi,
		urlConstants.video.capiMediaAtomPath,
	);
	if (capiAttempt !== undefined)
		return `${urlConstants.video.capiMediaAtomPath}${capiAttempt}`;

	return '';
};

const extractAssetId = (atom: Atom): string | undefined => {
	const assets: AtomAsset[] = atom.data?.media?.assets;
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

const extractVideoTrailImage = (atom: Atom): string | undefined => {
	const imageAssets: ImageAsset[] | undefined =
		atom.data?.media?.trailImage?.assets ||
		atom.data?.media?.posterImage?.assets;

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

const extractPlatform = (atom: Atom): Platform | undefined => {
	const mediaAssets: AtomAsset[] = atom.data?.media?.assets;

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

const extractAtomProperties = (atom: Atom): AtomProperties => {
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
