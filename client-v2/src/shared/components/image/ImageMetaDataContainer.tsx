import React from 'react';
import { styled } from '../../constants/theme';

const MetadataContainer = styled('div')`
  font-size: 10px;
  background-color: ${({ theme }) => theme.shared.colors.whiteLight};
`;

interface ImageMetadataContainerProps {
  imageSlideshowReplace?: boolean;
  imageReplace?: boolean;
  imageCutoutReplace?: boolean;
}

export const ImageMetadataContainer = ({
  imageSlideshowReplace,
  imageReplace,
  imageCutoutReplace
}: ImageMetadataContainerProps) => (
  <MetadataContainer>
    {imageSlideshowReplace && 'Slideshow'}
    {imageReplace && 'Image replaced'}
    {imageCutoutReplace && 'Cutout replaced'}
  </MetadataContainer>
);
