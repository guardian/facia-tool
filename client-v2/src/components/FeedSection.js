// @flow

import React from 'react';
import styled from 'styled-components';

import FrontsLogo from 'images/icons/fronts-logo.svg';
import { SectionHeaderUnpadded } from './layout/SectionHeader';
import SectionContent from './layout/SectionContent';
import Feed from './Feed';
import Clipboard from './Clipboard';
import ScrollContainer from './ScrollContainer';

const InlineContainer = styled('div')`
  display: inline-block;
  height: 100%;
`;

const FeedSectionContainer = styled('div')`
  width: 600px;
`;

const FeedContainer = InlineContainer.extend`
  width: 410px;
`;

const ClipboardContainer = InlineContainer.extend`
  width: 190px;
`;

const LogoTypeContainer = styled('div')`
  background-color: #121212;
  display: inline-block;
  padding: 0 16px;
  height: 60px;
  line-height: 60px;
`;

const LogoContainer = styled('div')`
  background-color: #515151;
  position: relative;
  display: inline-block;
`;

const LogoBackground = styled('div')`
  display: flex;
  flex-direction: row;
  width: 60px;
  height: 60px;
`;

const Logo = styled('img')`
  margin: auto;
  width: 38px;
  height: 24px;
`;

export default () => (
  <FeedSectionContainer>
    <ScrollContainer
      fixed={
        <SectionHeaderUnpadded>
          <LogoTypeContainer>F</LogoTypeContainer>
          <LogoContainer>
            <LogoBackground>
              <Logo src={FrontsLogo} alt="The Fronts tool" />
            </LogoBackground>
          </LogoContainer>
        </SectionHeaderUnpadded>
      }
    >
      <SectionContent>
        <FeedContainer>
          <Feed />
        </FeedContainer>
        <ClipboardContainer>
          <Clipboard />
        </ClipboardContainer>
      </SectionContent>
    </ScrollContainer>
  </FeedSectionContainer>
);
