import React from 'react';
import { styled } from 'shared/constants/theme';

import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';
import { media } from 'shared/util/mediaQueries';

const metaContainerWidth = 80;
const metaContainerWidthSmall = 60;

const MetaContainer = styled('div')`
  position: relative;
  min-width: ${metaContainerWidth}px;
  ${media.large`min-width: ${metaContainerWidthSmall}px;`}
  ${media.large`word-break: break-word`}
  padding: 0 4px;
`;

export default ({ children }: { children?: React.ReactNode }) => (
  <MetaContainer>
    {children}
    <ShortVerticalPinline />
  </MetaContainer>
);
