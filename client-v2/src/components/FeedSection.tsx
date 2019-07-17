import React from 'react';
import { styled } from 'constants/theme';

import SectionContent from './layout/SectionContent';
import FeedContainer from './FeedsContainer';
import Clipboard from './Clipboard';
import ClipboardForm from './ClipboardForm';
import FeedSectionHeader from './FeedSectionHeader';
import { media } from 'shared/util/mediaQueries';

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
  ${media.large`width: 335px;`}
  border-right: ${({ theme, isClipboardOpen }) =>
    isClipboardOpen
      ? `solid 1px ${theme.shared.base.colors.borderColor}`
      : null};
`;

const ClipboardFormContainer = styled.div`
  background: ${({ theme }) => theme.shared.collection.background};
  border-top: 1px solid ${({ theme }) => theme.shared.colors.greyLightPinkish};
`;

export default ({ isClipboardOpen }: Props) => (
  <FeedSectionContainer>
    <FeedSectionHeader />
    <FeedSectionContent>
      <FeedWrapper isClipboardOpen={isClipboardOpen}>
        <FeedContainer />
      </FeedWrapper>
      <Clipboard />
      <ClipboardFormContainer>
        <ClipboardForm />
      </ClipboardFormContainer>
    </FeedSectionContent>
  </FeedSectionContainer>
);
