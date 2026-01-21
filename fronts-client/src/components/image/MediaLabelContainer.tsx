import React from 'react';
import { styled } from '../../constants/theme';
import { theme } from 'constants/theme';
import { SelfHostedVideoPlayerFormat } from '../../util/Video';
import { getMediaLabel, getMediaLabelParts } from '../../util/mediaLabel';

const MetadataContainer = styled.div`
	font-size: 10px;
	background-color: ${theme.colors.whiteLight};
`;

interface MediaLabelContainerProps {
	imageSlideshowReplace?: boolean;
	imageReplace?: boolean;
	imageCutoutReplace?: boolean;
	hasMainVideo?: boolean;
	showMainVideo?: boolean;
	videoReplace?: boolean;
	mainVideoPlatform?: 'youtube' | 'url';
	mainVideoSelfHostedPlayerFormat?: SelfHostedVideoPlayerFormat;
	replacementVideoPlatform?: 'youtube' | 'url';
	replacementVideoSelfHostedPlayerFormat?: SelfHostedVideoPlayerFormat;
}

export const MediaLabelContainer = ({
	imageSlideshowReplace,
	imageReplace,
	imageCutoutReplace,
	hasMainVideo,
	showMainVideo,
	videoReplace,
	mainVideoPlatform,
	mainVideoSelfHostedPlayerFormat,
	replacementVideoPlatform,
	replacementVideoSelfHostedPlayerFormat,
}: MediaLabelContainerProps) => {
	const { selectedMediaType, placementType, videoFormatType } =
		getMediaLabelParts(
			imageSlideshowReplace,
			imageReplace,
			imageCutoutReplace,
			hasMainVideo,
			showMainVideo,
			videoReplace,
			mainVideoPlatform,
			mainVideoSelfHostedPlayerFormat,
			replacementVideoPlatform,
			replacementVideoSelfHostedPlayerFormat,
		);

	const mediaLabel = getMediaLabel(
		selectedMediaType,
		placementType,
		videoFormatType,
	);

	return mediaLabel && <MetadataContainer>{mediaLabel}</MetadataContainer>;
};
