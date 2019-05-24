import React from 'react';
import { styled } from 'constants/theme';

import SectionContent from './layout/SectionContent';
import FeedContainer from './FeedsContainer';
import Clipboard from './Clipboard';
import ClipboardMeta from './ClipboardMeta';
import FeedSectionHeader from './FeedSectionHeader';

const FeedSectionContainer = styled('div')`
  background-color: ${({ theme }) => theme.shared.base.colors.backgroundColor};
  width: 100%;
`;

const FeedWrapper = styled('div')`
  flex: 3 1 20vw;
  padding-right: 10px;
  margin-right: 10px;
  border-right: ${({ theme }) =>
    `solid 1px ${theme.shared.base.colors.borderColor}`};
`;

const ClipboardWrapper = styled.div``;

export default ({ fontSize = '14px' }: { fontSize?: string }) => (
  <FeedSectionContainer>
    <FeedSectionHeader />
    <SectionContent>
      <FeedWrapper>
        <FeedContainer fontSize={fontSize} />
      </FeedWrapper>
      <ClipboardWrapper>
        <Clipboard />
      </ClipboardWrapper>
      <ClipboardMeta />
    </SectionContent>
  </FeedSectionContainer>
);
