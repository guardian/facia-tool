import urlConstants from '../constants/url';
import type { Atom, Platform } from '../types/Capi';

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
	const assetId = atom.data?.media?.assets?.[0]?.id;
	if (!assetId) {
		console.error(`No assets found for atom ${atom.id}`);
		return undefined;
	}
	return assetId;
};

const extractVideoTrailImage = (atom: Atom): string | undefined => {
	const imageFile: string | undefined =
		atom.data?.media?.trailImage?.assets?.[0]?.file ||
		atom.data?.media?.posterImage?.assets?.[0]?.file;

	if (!imageFile) {
		console.error(`No trail image found for atom ${atom.id}`);
		return undefined;
	} else {
		return imageFile;
	}
};

const extractPlatform = (atom: Atom): Platform | undefined => {
	const mediaAssetPlatform: Platform | undefined =
		atom.data?.media?.assets?.[0]?.platform;

	if (!mediaAssetPlatform) {
		console.error(`No media assets found for atom ${atom.id}`);
		return undefined;
	} else {
		return mediaAssetPlatform;
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

const extractAtomProperties = (atom?: Atom): AtomProperties => {
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
