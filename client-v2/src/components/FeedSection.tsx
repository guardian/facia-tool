import React from 'react';
import { styled } from 'constants/theme';

import SectionContent from './layout/SectionContent';
import FeedContainer from './FeedsContainer';
import Clipboard from './Clipboard';
import ClipboardMeta from './ClipboardMeta';
import FeedSectionHeader from './FeedSectionHeader';

interface Props {
  isClipboardOpen: boolean;
}

const FeedSectionContainer = styled('div')`
  background-color: ${({ theme }) => theme.shared.base.colors.backgroundColor};
`;

const FeedSectionContent = styled(SectionContent)`
  padding-right: 0px;
  padding-top: 10px;
`;

const FeedWrapper = styled('div')<{ isClipboardOpen: boolean }>`
  width: 409px;
  border-right: ${({ theme, isClipboardOpen }) =>
    isClipboardOpen
      ? `solid 1px ${theme.shared.base.colors.borderColor}`
      : null};
`;

export default ({ isClipboardOpen }: Props) => (
  <FeedSectionContainer>
    <FeedSectionHeader />
    <FeedSectionContent>
      <FeedWrapper isClipboardOpen={isClipboardOpen}>
        <FeedContainer />
      </FeedWrapper>
      <Clipboard />
      <div>
        <ClipboardMeta />
      </div>
    </FeedSectionContent>
  </FeedSectionContainer>
);
