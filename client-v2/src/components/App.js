// @flow

import React from 'react';
import styled, { injectGlobal } from 'styled-components';
import { Switch, Route } from 'react-router-dom';

import { priorities } from 'constants/priorities';
import SectionHeaderWithLogo from './layout/SectionHeaderWithLogo';
import GHGuardianHeadlineBoldTtf from '../fonts/headline/GHGuardianHeadline-Bold.ttf';
import GHGuardianHeadlineBoldWoff from '../fonts/headline/GHGuardianHeadline-Bold.woff';
import GHGuardianHeadlineBoldWoff2 from '../fonts/headline/GHGuardianHeadline-Bold.woff2';
import GHGuardianHeadlineMediumTtf from '../fonts/headline/GHGuardianHeadline-Medium.ttf';
import GHGuardianHeadlineMediumWoff from '../fonts/headline/GHGuardianHeadline-Medium.woff';
import GHGuardianHeadlineMediumWoff2 from '../fonts/headline/GHGuardianHeadline-Medium.woff2';
import GuardianTextSansTtf from '../fonts/text/GuardianTextSans-Regular.ttf';
import GuardianTextSansWoff from '../fonts/text/GuardianTextSans-Regular.woff';
import GuardianTextSansWoff2 from '../fonts/text/GuardianTextSans-Regular.woff2';
import GuardianTextSansTtfBold from '../fonts/text/GuardianTextSans-Bold.ttf';
import GuardianTextSansBoldWoff from '../fonts/text/GuardianTextSans-Bold.woff';
import GuardianTextSansBoldWoff2 from '../fonts/text/GuardianTextSans-Bold.woff2';
import FrontsEdit from './FrontsEdit/Edit';
import Home from './Home';
import NotFound from './NotFound';

injectGlobal`
  @font-face {
    font-family: GHGuardianHeadline-Bold
    src: url(${GHGuardianHeadlineBoldWoff2}) format('woff2'),
      url(${GHGuardianHeadlineBoldWoff}) format('woff'),
      url(${GHGuardianHeadlineBoldTtf}) format('truetype');
      
    font-style: 'bold',
    font-weight: 800
  }

  @font-face {
    font-family: GHGuardianHeadline-Medium
    src: url(${GHGuardianHeadlineMediumWoff2}) format('woff2'),
      url(${GHGuardianHeadlineMediumWoff}) format('woff'),
      url(${GHGuardianHeadlineMediumTtf}) format('truetype');
      
    font-style: 'bold',
    font-weight: 800
  }

  @font-face {
    font-family: TS3TextSans
    src: url(${GuardianTextSansWoff2}) format('woff2'),
      url(${GuardianTextSansWoff}) format('woff'),
      url(${GuardianTextSansTtf}) format('truetype');
      
    font-style: 'normal',
    font-weight: 'normal'
  }

  @font-face {
    font-family: TS3TextSans-Bold
    src: url(${GuardianTextSansBoldWoff2}) format('woff2'),
      url(${GuardianTextSansTtfBold}) format('truetype'),
      url(${GuardianTextSansBoldWoff}) format('woff');
    font-style: 'normal',
    font-weight: 'normal'
  }
`;

const AppContainer = styled('div')`
  background-color: #fff;
  color: #333;
  font-family: 'Helvetica Neue', Helvetica, Arial;
  font-size: 16px;
  font-weight: 100;
  height: 100%;
  width: 100%;
  font-family: TS3TextSans;
  -webkit-font-smoothing: antialiased;
`;

const BackgroundHeader = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const App = () => (
  <AppContainer>
    <BackgroundHeader>
      <SectionHeaderWithLogo />
    </BackgroundHeader>
    <Switch>
      <Route
        exact
        path={`/:priority(${Object.keys(priorities).join('|')})/:frontId?`}
        component={FrontsEdit}
      />
      <Route exact path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  </AppContainer>
);

export default App;
