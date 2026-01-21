import {
	SelfHostedVideoPlayerFormat,
	VideoFormatType,
	videoPlayerFormatMap,
} from './Video';

type SelectedMediaType = 'image' | 'cutout' | 'video' | 'slideshow';
type PlacementType = 'main' | 'added' | 'replaced';

const getSelectedMediaType = (
	imageSlideshowReplace?: boolean,
	imageReplace?: boolean,
	imageCutoutReplace?: boolean,
	showMainVideo?: boolean,
	videoReplace?: boolean,
): SelectedMediaType => {
	if (imageSlideshowReplace) return 'slideshow';
	if (imageReplace) return 'image';
	if (imageCutoutReplace) return 'cutout';
	if (showMainVideo || videoReplace) return 'video';
	return 'image';
};

const getPlacementType = (
	selectedMediaType: SelectedMediaType,
	hasMainVideo?: boolean,
	showMainVideo?: boolean,
	videoReplace?: boolean,
	imageReplace?: boolean,
	imageCutoutReplace?: boolean,
): PlacementType => {
	if (selectedMediaType === 'slideshow') {
		return 'added';
	}
	if (selectedMediaType === 'video') {
		return getVideoPlacementType(hasMainVideo, showMainVideo, videoReplace);
	}
	return imageReplace || imageCutoutReplace ? 'replaced' : 'main';
};

const getVideoFormatType = (
	videoPlatform?: 'youtube' | 'url',
	videoSelfHostedPlayerFormat?: SelfHostedVideoPlayerFormat,
): VideoFormatType => {
	return videoPlatform === 'url' && videoSelfHostedPlayerFormat
		? videoPlayerFormatMap[videoSelfHostedPlayerFormat].label
		: videoPlayerFormatMap['youtube'].label;
};

const getVideoPlacementType = (
	hasMainVideo?: boolean,
	showMainVideo?: boolean,
	videoReplace?: boolean,
): PlacementType => {
	if (showMainVideo) return 'main';
	if (videoReplace) return hasMainVideo ? 'replaced' : 'added';
	return 'main';
};

export const getMediaLabelParts = (
	imageSlideshowReplace?: boolean,
	imageReplace?: boolean,
	imageCutoutReplace?: boolean,
	hasMainVideo?: boolean,
	showMainVideo?: boolean,
	videoReplace?: boolean,
	mainVideoPlatform?: 'youtube' | 'url',
	mainVideoSelfHostedPlayerFormat?: SelfHostedVideoPlayerFormat,
	replacementVideoPlatform?: 'youtube' | 'url',
	replacementVideoSelfHostedPlayerFormat?: SelfHostedVideoPlayerFormat,
): {
	selectedMediaType: SelectedMediaType;
	placementType: PlacementType;
	videoFormatType: VideoFormatType | null;
} => {
	const selectedMediaType = getSelectedMediaType(
		imageSlideshowReplace,
		imageReplace,
		imageCutoutReplace,
		showMainVideo,
		videoReplace,
	);
	const placementType = getPlacementType(
		selectedMediaType,
		hasMainVideo,
		showMainVideo,
		videoReplace,
		imageReplace,
		imageCutoutReplace,
	);
	const videoFormatType =
		selectedMediaType === 'video'
			? getVideoFormatType(
					showMainVideo ? mainVideoPlatform : replacementVideoPlatform,
					showMainVideo
						? mainVideoSelfHostedPlayerFormat
						: replacementVideoSelfHostedPlayerFormat,
				)
			: null;

	return {
		selectedMediaType,
		placementType,
		videoFormatType,
	};
};

export const getMediaLabel = (
	selectedMediaType: SelectedMediaType,
	placementType: PlacementType,
	videoFormatType: VideoFormatType | null,
) => {
	if (
		(selectedMediaType === 'cutout' && placementType !== 'replaced') ||
		(selectedMediaType === 'image' && placementType !== 'replaced') ||
		(selectedMediaType === 'slideshow' && placementType !== 'added') ||
		(selectedMediaType === 'video' && videoFormatType === null) ||
		(selectedMediaType !== 'video' && videoFormatType !== null)
	)
		return null;

	const parts: string[] = [];
	if (placementType === 'main') parts.push(placementType);
	if (videoFormatType) parts.push(videoFormatType);
	if (selectedMediaType !== 'video') parts.push(selectedMediaType);
	if (placementType === 'replaced') parts.push(placementType);

	const label = parts.join(' ');
	return label ? label.charAt(0).toUpperCase() + label.slice(1) : label;
};
