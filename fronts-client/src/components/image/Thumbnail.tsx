import { theme, styled } from 'constants/theme';

const ThumbnailBase = styled.div`
	background-size: cover;
	background-color: ${theme.base.colors.backgroundColorFocused};
`;

const ThumbnailSmall = styled(ThumbnailBase)<{
	url?: string | void;
	isDraggingImageOver?: boolean;
	imageHide?: boolean;
	isPortrait?: boolean;
	showLandscape54?: boolean;
	showSquareThumbnail?: boolean;
}>`
	position: relative;
	width: ${theme.thumbnailImage.width};
	min-width: ${theme.thumbnailImage.width};
	color: white;
	font-size: 10px;
	font-weight: bold;
	opacity: ${({ imageHide }) => (imageHide && imageHide ? '0.5' : '1')};
	background-image: ${({ url }) => `url('${url}')`};

	${({ isPortrait }) =>
		isPortrait &&
		`
    background-size: contain;
    background-repeat: no-repeat;
    background-position-x: center;
  `}
	${({ showLandscape54 }) =>
		showLandscape54
			? `
    aspect-ratio: 5/4;
    background-position: center center;
    background-repeat: no-repeat;
  `
			: `height: ${theme.thumbnailImage.height};`}

  ${({ isDraggingImageOver }) =>
		isDraggingImageOver &&
		`background: ${theme.base.colors.dropZoneActiveStory};
      :before {
        content: 'Replace image';
        position: absolute;
        top: 18px;
        left: 9px;
      }`};

	${({ showSquareThumbnail }) =>
		showSquareThumbnail &&
		`width: ${theme.thumbnailImageSquare.width};
     min-width: ${theme.thumbnailImageSquare.width};
     height: ${theme.thumbnailImageSquare.height}
     aspect-ratio: 1/1;
     `};
`;

const ThumbnailCutout = styled.img<{
	position?: 'bottomLeft' | 'bottomRight';
}>`
	position: absolute;
	width: 25px;
	bottom: 0;
	${({ position }) =>
		position === 'bottomRight' ? 'right: -13px' : 'left: -13px'};
`;

const ThumbnailEditForm = styled(ThumbnailBase)<{
	imageHide: boolean;
	url: string | undefined | void;
}>`
	width: 100%;
	height: 115px;
	margin-bottom: 10px;
	opacity: ${({ imageHide }) => (imageHide ? 0.5 : 1)};
	background-image: ${({ url }) => `url('${url}')`};
`;

export { ThumbnailSmall, ThumbnailEditForm, ThumbnailCutout };

export default styled(ThumbnailBase)`
	width: 130px;
	min-width: 130px;
	height: 100%;
	min-height: 67px;
`;
