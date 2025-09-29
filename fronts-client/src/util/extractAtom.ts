import urlConstants from '../constants/url';
import type { AtomProperties, Atom, AtomAsset } from '../types/Capi';

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

const extractVideoImage = (atom: Atom): string | undefined => {
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

const extractCurrentActiveAssets = (atom: Atom): AtomAsset[] => {
	const activeVersion = atom.data?.media?.activeVersion;
	return activeVersion !== undefined
		? atom.data?.media?.assets?.filter(
				(asset) => asset.version === activeVersion,
			)
		: [];
};

const findAssetByMimeType = (atomAssets: AtomAsset[], mimeType: string) => {
	return atomAssets.find((asset) => asset.mimeType === mimeType);
};

const extractAssetsByMimeType = (atomAssets: AtomAsset[]) => {
	return {
		m3u8: findAssetByMimeType(atomAssets, 'application/vnd.apple.mpegurl'),
		mp4: findAssetByMimeType(atomAssets, 'video/mp4'),
		vtt: findAssetByMimeType(atomAssets, 'text/vtt'),
	};
};

const getActiveAtomProperties = (atom: Atom): AtomProperties => {
	const currentActiveAssets = extractCurrentActiveAssets(atom);
	const firstActiveAsset = currentActiveAssets[0];
	const platform = firstActiveAsset?.platform;
	const videoImage = extractVideoImage(atom);

	// Youtube atom
	if (platform === 'youtube') {
		return {
			platform,
			videoImage,
			youtube: firstActiveAsset,
		};
	}

	// Self-hosted atom
	const { m3u8, mp4, vtt } = extractAssetsByMimeType(currentActiveAssets);

	return {
		platform,
		videoImage,
		url: {
			m3u8,
			mp4,
			vtt,
		},
	};
};

export { extractAtomId, getActiveAtomProperties };
