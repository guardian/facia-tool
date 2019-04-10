import React from 'react';
import { styled } from 'constants/theme';

import SectionContent from './layout/SectionContent';
import FeedContainer from './FeedsContainer';
import Clipboard from './Clipboard';
import ClipboardMeta from './ClipboardMeta';
import FeedSectionHeader from './FeedSectionHeader';

const FeedSectionContainer = styled('div')`
  background-color: ${({ theme }) => theme.shared.base.colors.backgroundColor};
`;

const FeedWrapper = styled('div')`
  width: 409px;
  padding-right: 10px;
  margin-right: 10px;
  border-right: ${({ theme }) =>
    `solid 1px ${theme.shared.base.colors.borderColor}`};
`;

export default () => (
  <FeedSectionContainer>
    <FeedSectionHeader />
    <SectionContent>
      <FeedWrapper>
        <FeedContainer />
      </FeedWrapper>
      <Clipboard />
      <div>
        <ClipboardMeta />
      </div>
    </SectionContent>
  </FeedSectionContainer>
);
