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
	showMainVideo?: boolean;
}

export const ImageMetadataContainer = ({
	imageSlideshowReplace,
	imageReplace,
	imageCutoutReplace,
	showMainVideo,
}: ImageMetadataContainerProps) => (
	<MetadataContainer>
		{imageSlideshowReplace && 'Slideshow'}
		{imageReplace && 'Image replaced'}
		{imageCutoutReplace && 'Cutout replaced'}
		{showMainVideo && 'Show video'}
	</MetadataContainer>
);
