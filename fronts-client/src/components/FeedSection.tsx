import React from 'react';
import { styled, theme } from 'constants/theme';

import SectionContent from './layout/SectionContent';
import FeedContainer from './FeedsContainer';
import Clipboard from './Clipboard';
import FeedSectionHeader from './FeedSectionHeader';
import { media } from 'shared/util/mediaQueries';

interface Props {
  isClipboardOpen: boolean;
}

const FeedSectionContainer = styled.div`
  background-color: ${theme.base.colors.backgroundColor};
`;

const FeedSectionContent = styled(SectionContent)`
  padding-right: 0px;
  padding-top: 10px;
`;

const FeedWrapper = styled.div<{ isClipboardOpen: boolean }>`
  width: 409px;
  ${media.large`width: 335px;`}
  border-right: ${({ isClipboardOpen }) =>
    isClipboardOpen ? `solid 1px ${theme.base.colors.borderColor}` : null};
`;

export default ({ isClipboardOpen }: Props) => (
  <FeedSectionContainer>
    <FeedSectionHeader />
    <FeedSectionContent>
      <FeedWrapper isClipboardOpen={isClipboardOpen}>
        <FeedContainer />
      </FeedWrapper>
      <Clipboard />
    </FeedSectionContent>
  </FeedSectionContainer>
);
