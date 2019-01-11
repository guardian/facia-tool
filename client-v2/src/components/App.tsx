import React from 'react';
import styled, { injectGlobal, ThemeProvider } from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import DropDisabler from './util/DropDisabler';

import { theme } from 'shared/constants/theme';
import { priorities } from 'constants/priorities';
import SectionHeaderWithLogo from './layout/SectionHeaderWithLogo';
import GHGuardianHeadlineBoldTtf from '../fonts/headline/GHGuardianHeadline-Bold.ttf';
import GHGuardianHeadlineBoldWoff from '../fonts/headline/GHGuardianHeadline-Bold.woff';
import GHGuardianHeadlineBoldWoff2 from '../fonts/headline/GHGuardianHeadline-Bold.woff2';
import GHGuardianHeadlineMediumTtf from '../fonts/headline/GHGuardianHeadline-Medium.ttf';
import GHGuardianHeadlineMediumWoff from '../fonts/headline/GHGuardianHeadline-Medium.woff';
import GHGuardianHeadlineMediumWoff2 from '../fonts/headline/GHGuardianHeadline-Medium.woff2';
import GHGuardianHeadlineRegularTtf from '../fonts/headline/GHGuardianHeadline-Regular.ttf';
import GHGuardianHeadlineRegularWoff from '../fonts/headline/GHGuardianHeadline-Regular.woff';
import GHGuardianHeadlineRegularWoff2 from '../fonts/headline/GHGuardianHeadline-Regular.woff2';
import GuardianTextSansTtf from '../fonts/text/GuardianTextSans-Regular.ttf';
import GuardianTextSansWoff from '../fonts/text/GuardianTextSans-Regular.woff';
import GuardianTextSansWoff2 from '../fonts/text/GuardianTextSans-Regular.woff2';
import GuardianTextSansTtfBold from '../fonts/text/GuardianTextSans-Bold.ttf';
import GuardianTextSansBoldWoff from '../fonts/text/GuardianTextSans-Bold.woff';
import GuardianTextSansBoldWoff2 from '../fonts/text/GuardianTextSans-Bold.woff2';
import FrontsEdit from './FrontsEdit/Edit';
import Home from './Home';
import NotFound from './NotFound';
import ConfirmModal from './ConfirmModal';

// tslint:disable:no-unused-expression
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
    font-family: GHGuardianHeadline-Regular
    src: url(${GHGuardianHeadlineRegularWoff2}) format('woff2'),
      url(${GHGuardianHeadlineRegularWoff}) format('woff'),
      url(${GHGuardianHeadlineRegularTtf}) format('truetype');

     font-style: 'normal',
     font-weight: 'normal'
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

  html, body {
    font-family: 'Helvetica Neue', Helvetica, Arial;
    font-size: 16px;
    font-weight: 100;
    font-family: TS3TextSans;
    -webkit-font-smoothing: antialiased;
  }
`;

const AppContainer = styled('div')`
  background-color: #fff;
  color: #333;
  height: 100%;
  width: 100%;
`;

const BackgroundHeader = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const App = () => (
  <ThemeProvider theme={theme}>
    <DropDisabler>
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
      <ConfirmModal />
    </DropDisabler>
  </ThemeProvider>
);

export default App;
