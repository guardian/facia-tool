import React from 'react';
import { injectGlobal, ThemeProvider } from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import DropDisabler from './util/DropDisabler';

import { theme as styleTheme, styled } from 'constants/theme';
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
import { frontsEdit, editions } from 'constants/routes';
import ManagedView from './Editions/ManageView';

// tslint:disable:no-unused-expression
injectGlobal`
  @font-face {
    font-family: GHGuardianHeadline;
    src: url(${GHGuardianHeadlineBoldWoff2}) format('woff2'),
      url(${GHGuardianHeadlineBoldWoff}) format('woff'),
      url(${GHGuardianHeadlineBoldTtf}) format('truetype');
    font-weight: bold;
    font-weight: 600 800;
  }

  @font-face {
    font-family: GHGuardianHeadline;
    src: url(${GHGuardianHeadlineRegularWoff2}) format('woff2'),
      url(${GHGuardianHeadlineRegularWoff}) format('woff'),
      url(${GHGuardianHeadlineRegularTtf}) format('truetype');
    font-style: normal;
    font-weight: 100 400;
  }

  @font-face {
    font-family: GHGuardianHeadline;
    src: url(${GHGuardianHeadlineMediumWoff2}) format('woff2'),
      url(${GHGuardianHeadlineMediumWoff}) format('woff'),
      url(${GHGuardianHeadlineMediumTtf}) format('truetype');
    font-weight: 500;
  }

  @font-face {
    font-family: TS3TextSans;
    src: url(${GuardianTextSansWoff2}) format('woff2'),
      url(${GuardianTextSansWoff}) format('woff'),
      url(${GuardianTextSansTtf}) format('truetype');
    font-style: normal;
    font-weight: 100 400;
  }

  @font-face {
    font-family: TS3TextSans;
    src: url(${GuardianTextSansBoldWoff2}) format('woff2'),
      url(${GuardianTextSansTtfBold}) format('truetype'),
      url(${GuardianTextSansBoldWoff}) format('woff');
    font-weight: bold;
    font-weight: 500 800;
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
  background-color: ${({ theme }) =>
    theme.shared.base.colors.backgroundColorLight};
  color: ${({ theme }) => theme.shared.base.colors.text};
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
  <ThemeProvider theme={styleTheme}>
    <DropDisabler>
      <AppContainer>
        <BackgroundHeader>
          <SectionHeaderWithLogo greyHeader={true} />
        </BackgroundHeader>
        <Switch>
          <Route exact path={frontsEdit} component={FrontsEdit} />
          <Route exact path="/" component={Home} />
          <Route exact path={editions} component={ManagedView} />
          <Route component={NotFound} />
        </Switch>
      </AppContainer>
      <ConfirmModal />
    </DropDisabler>
  </ThemeProvider>
);

export default App;
