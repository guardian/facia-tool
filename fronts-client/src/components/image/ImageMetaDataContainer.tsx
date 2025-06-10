import React from 'react';
import { styled } from '../../constants/theme';
import { theme } from 'constants/theme';

const MetadataContainer = styled.div`
	font-size: 10px;
	background-color: ${theme.colors.whiteLight};
`;

interface ImageMetadataContainerProps {
	imageSlideshowReplace?: boolean;
	imageReplace?: boolean;
	imageCutoutReplace?: boolean;
	hasMainVideo?: boolean;
	showMainVideo?: boolean;
	videoReplace?: boolean;
	mainMediaIsSelfHosted?: boolean;
	replacementVideoIsSelfHosted?: boolean;
}

const getImageMetadata = (
	imageSlideshowReplace?: boolean,
	imageReplace?: boolean,
	imageCutoutReplace?: boolean,
	hasMainVideo?: boolean,
	showMainVideo?: boolean,
	videoReplace?: boolean,
	mainMediaIsSelfHosted?: boolean,
	replacementVideoIsSelfHosted?: boolean,
) => {
	if (imageSlideshowReplace) return 'Slideshow';
	if (imageReplace) return 'Image replaced';
	if (imageCutoutReplace) return 'Cutout replaced';
	if (showMainVideo && mainMediaIsSelfHosted) return 'Looping video';
	if (showMainVideo) return 'Main video';
	if (videoReplace && replacementVideoIsSelfHosted) return 'Looping video';
	if (hasMainVideo && videoReplace) return 'Video replaced';
	if (videoReplace) return 'Show video';
	return null;
};

export const ImageMetadataContainer = ({
	imageSlideshowReplace,
	imageReplace,
	imageCutoutReplace,
	hasMainVideo,
	showMainVideo,
	videoReplace,
	mainMediaIsSelfHosted,
	replacementVideoIsSelfHosted,
}: ImageMetadataContainerProps) => (
	<MetadataContainer>
		{getImageMetadata(
			imageSlideshowReplace,
			imageReplace,
			imageCutoutReplace,
			hasMainVideo,
			showMainVideo,
			videoReplace,
			mainMediaIsSelfHosted,
			replacementVideoIsSelfHosted,
		)}
	</MetadataContainer>
);
