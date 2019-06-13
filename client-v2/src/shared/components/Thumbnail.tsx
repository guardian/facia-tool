import { styled } from 'shared/constants/theme';

const ThumbnailBase = styled('div')`
  background-size: cover;
  background-color: ${({ theme }) =>
    theme.shared.base.colors.backgroundColorFocused};
`;

const ThumbnailSmall = styled(ThumbnailBase)`
  position: relative;
  width: 83px;
  min-width: 83px;
  height: 50px;
`;

const ThumbnailCutout = styled('img')<{
  position?: 'bottomLeft' | 'bottomRight';
}>`
  position: absolute;
  width: 25px;
  bottom: 0;
  ${({ position }) =>
    position === 'bottomRight' ? 'right: -15px' : 'left: -15px'};
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
