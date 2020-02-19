import React from 'react';
import { styled } from 'shared/constants/theme';

import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';
import { media } from 'shared/util/mediaQueries';
import { CardSizes } from 'shared/types/Collection';

const metaContainerSizeWidthMap = {
  default: 100,
  medium: 80,
  small: 60
} as { [Sizes in CardSizes]: number };

const MetaContainer = styled.div<{ size?: CardSizes }>`
  position: relative;
  flex-shrink: 0;
  /* If we have a size property, use that. */
  width: ${({ size }) => size && `${metaContainerSizeWidthMap[size]}px`};
  /* If we don't, fall back to media queries. */
  ${({ size }) =>
    !size &&
    media.large`
      width: ${metaContainerSizeWidthMap.small}px;
      word-break: break-word;
    `}
  padding: 0 4px;
`;

export default ({
  children,
  size = 'default'
}: {
  children?: React.ReactNode;
  size?: CardSizes;
}) => (
  <MetaContainer size={size}>
    {children}
    <ShortVerticalPinline />
  </MetaContainer>
);
