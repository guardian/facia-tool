// @flow

import React from 'react';
import styled from 'styled-components';

import SectionHeaderWithLogo from './layout/SectionHeaderWithLogo';
import SectionContent from './layout/SectionContent';
import Feed from './Feed';
import Clipboard from './Clipboard';

const FeedSectionContainer = styled('div')`
  background-color: #f6f6f6;
`;

const FeedContainer = styled('div')`
  width: 389px;
  padding-right: 10px;
  margin-right: 10px;
  border-right: solid 1px #c9c9c9;
`;

const ClipboardContainer = styled('div')`
  width: 180px;
  overflow-y: scroll;
`;

export default () => (
  <FeedSectionContainer>
    <SectionHeaderWithLogo />
    <SectionContent>
      <FeedContainer>
        <Feed />
      </FeedContainer>
      <ClipboardContainer>
        <Clipboard />
      </ClipboardContainer>
    </SectionContent>
  </FeedSectionContainer>
);
