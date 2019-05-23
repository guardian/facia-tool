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

const FeedSectionContent = styled(SectionContent)`
  padding-right: 0px;
  margin-top: 10px;
`;

const FeedWrapper = styled('div')`
  width: 409px;
  border-right: ${({ theme }) =>
    `solid 1px ${theme.shared.base.colors.borderColor}`};
`;

export default () => (
  <FeedSectionContainer>
    <FeedSectionHeader />
    <FeedSectionContent>
      <FeedWrapper>
        <FeedContainer />
      </FeedWrapper>
      <Clipboard />
      <div>
        <ClipboardMeta />
      </div>
    </FeedSectionContent>
  </FeedSectionContainer>
);
