// @flow

import React from 'react';
import styled from 'styled-components';

import SectionHeaderWithLogo from './layout/SectionHeaderWithLogo';
import SectionContent from './layout/SectionContent';
import Feed from './Feed';
import Clipboard from './Clipboard';

const FloatedContainer = styled('div')`
  float: left;
  height: 100%;
`;

const FeedSectionContent = SectionContent.extend`
  height: calc(100% - 60px);
  min-height: calc(100% - 60px);
`;

const FeedSectionContainer = styled('div')`
  width: 250px;
  background-color: #f6f6f6;
`;

const FeedContainer = FloatedContainer.extend`
  width: 389px;
  padding-right: 10px;
  margin-right: 10px;
  border-right: solid 1px #c9c9c9;
`;

const ClipboardContainer = FloatedContainer.extend`
  width: 180px;
  overflow-y: scroll;
`;

export default () => (
  <FeedSectionContainer>
    <SectionHeaderWithLogo />
    <FeedSectionContent>
      <FeedContainer>
        <Feed />
      </FeedContainer>
      <ClipboardContainer>
        <Clipboard />
      </ClipboardContainer>
    </FeedSectionContent>
  </FeedSectionContainer>
);
