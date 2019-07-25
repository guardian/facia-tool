import { styled } from 'shared/constants/theme';
import { theme as theme2 } from 'constants/theme';

const ThumbnailBase = styled('div')`
  background-size: cover;
  background-color: ${({ theme }) =>
    theme.shared.base.colors.backgroundColorFocused};
`;

const ThumbnailSmall = styled(ThumbnailBase)<{
  url?: string;
  isDraggingImageOver?: boolean;
  imageHide?: boolean;
}>`
  position: relative;
  width: 83px;
  min-width: ${theme2.shared.thumbnailImage.width};
  height: ${theme2.shared.thumbnailImage.height};
  color: white;
  font-size: 10px;
  font-weight: bold;
  opacity: ${({imageHide}) => imageHide && imageHide ? '0.5' : '1'};
  ${({ isDraggingImageOver, url }) =>
    isDraggingImageOver 
    ?
      `background: ${theme2.base.colors.dropZoneActiveStory};
      :before {
        content: 'Replace image';
        position: absolute;
        top: 18px;
        left: 9px;
      }`
    :
      `background-image: url('${url}');`
  };
`;

const ThumbnailCutout = styled('img')<{
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
  height: 115px
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
