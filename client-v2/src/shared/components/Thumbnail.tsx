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

export { ThumbnailSmall };

export default styled(ThumbnailBase)`
  width: 130px;
  min-width: 130px;
  height: 83px;
`;
