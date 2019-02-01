import React from 'react';
import { styled } from 'constants/theme';

import SectionHeaderWithLogo from './layout/SectionHeaderWithLogo';
import SectionContent from './layout/SectionContent';
import FeedContainer from './FeedsContainer';
import Clipboard from './Clipboard';
import ClipboardMeta from './ClipboardMeta';
import Button from 'shared/components/input/ButtonDefault';

const FeedSectionContainer = styled('div')`
  background-color: ${({ theme }) => theme.shared.base.colors.backgroundColor};
`;

const FeedWrapper = styled('div')`
  width: 389px;
  padding-right: 10px;
  margin-right: 10px;
  border-right: ${({ theme }) =>
    `solid 1px ${theme.shared.base.colors.borderColor}`};
`;

const ClipboardWrapper = styled('div')`
  width: 180px;
  overflow-y: scroll;
`;

const FeedbackButton = Button.extend<{
  href: string;
  target: string;
}>`
  margin-left: auto;
  align-self: center;
  margin-right: 10px;
  line-height: 24px;
`.withComponent('a');

export default () => (
  <FeedSectionContainer>
    <SectionHeaderWithLogo>
      <FeedbackButton
        href="https://docs.google.com/forms/d/e/1FAIpQLSc4JF0GxrKoxQgsFE9_tQfjAo1RKRU4M5bJWJRKaVlHbR2rpA/viewform?c=0&w=1"
        target="_blank"
      >
        Send us feedback
      </FeedbackButton>
    </SectionHeaderWithLogo>
    <SectionContent>
      <FeedWrapper>
        <FeedContainer />
      </FeedWrapper>
      <ClipboardWrapper>
        <Clipboard />
      </ClipboardWrapper>
      <div>
        <ClipboardMeta />
      </div>
    </SectionContent>
  </FeedSectionContainer>
);
