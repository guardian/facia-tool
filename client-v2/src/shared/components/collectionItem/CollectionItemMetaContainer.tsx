import React from 'react';
import { styled } from 'shared/constants/theme';

import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';

const MetaContainer = styled('div')`
  position: relative;
  width: 80px;
  padding: 0 4px;
`;

export default ({ children }: { children: React.ReactNode }) => (
  <MetaContainer>
    {children}
    <ShortVerticalPinline />
  </MetaContainer>
);
