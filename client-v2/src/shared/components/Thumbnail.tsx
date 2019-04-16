import { styled } from 'shared/constants/theme';

const ThumbnailBase = styled('div')`
  background-size: cover;
  background-color: ${({ theme }) =>
    theme.shared.base.colors.backgroundColorFocused};
`;

const ThumbnailSmall = styled(ThumbnailBase)`
  width: 83px;
  min-width: 83px;
  height: 50px;
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

export { ThumbnailSmall, ThumbnailEditForm };

export default styled(ThumbnailBase)`
  width: 130px;
  min-width: 130px;
  height: 67px;
`;
