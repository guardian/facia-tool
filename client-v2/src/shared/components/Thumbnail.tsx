import { styled } from 'shared/constants/theme';

const ThumbnailBase = styled('div')`
  background-size: cover;
  background-color: ${({ theme }) =>
    theme.shared.base.colors.backgroundColorFocused};
`;

const ThumbnailSmall = styled(ThumbnailBase)`
  width: 83px;
  height: 50px;
  margin: 3px 5px 3px 5px;
`;

export { ThumbnailSmall };

export default styled(ThumbnailBase)`
  width: 130px;
  height: 83px;
`;
