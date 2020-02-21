import { theme, styled } from 'constants/theme';

const ThumbnailBase = styled.div`
  background-size: cover;
  background-color: ${theme.base.colors.backgroundColorFocused};
`;

const ThumbnailSmall = styled(ThumbnailBase)<{
  url?: string | void;
  isDraggingImageOver?: boolean;
  imageHide?: boolean;
}>`
  position: relative;
  width: ${theme.thumbnailImage.width};
  min-width: ${theme.thumbnailImage.width};
  height: ${theme.thumbnailImage.height};
  color: white;
  font-size: 10px;
  font-weight: bold;
  opacity: ${({ imageHide }) => (imageHide && imageHide ? '0.5' : '1')};
  background-image: ${({ url }) => `url('${url}')`};
  ${({ isDraggingImageOver }) =>
    isDraggingImageOver &&
    `background: ${theme.base.colors.dropZoneActiveStory};
      :before {
        content: 'Replace image';
        position: absolute;
        top: 18px;
        left: 9px;
      }`};
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
