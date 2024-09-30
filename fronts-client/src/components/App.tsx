import React from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import DropDisabler from './util/DropDisabler';

import { theme as styleTheme, styled, theme } from 'constants/theme';
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
import GuardianTextSansRegularTtf from '../fonts/text/GuardianTextSans-Regular.ttf';
import GuardianTextSansRegularWoff from '../fonts/text/GuardianTextSans-Regular.woff';
import GuardianTextSansRegularWoff2 from '../fonts/text/GuardianTextSans-Regular.woff2';
import GuardianTextSansTtfBold from '../fonts/text/GuardianTextSans-Bold.ttf';
import GuardianTextSansBoldWoff from '../fonts/text/GuardianTextSans-Bold.woff';
import GuardianTextSansBoldWoff2 from '../fonts/text/GuardianTextSans-Bold.woff2';
import GuardianTextSansRegularItalicTtf from '../fonts/text/GuardianTextSans-RegularItalic.ttf';
import GuardianTextSansRegularItalicWoff from '../fonts/text/GuardianTextSans-RegularItalic.woff';
import GuardianTextSansRegularItalicWoff2 from '../fonts/text/GuardianTextSans-RegularItalic.woff2';
import GuardianTextSansBoldItalicTtf from '../fonts/text/GuardianTextSans-BoldItalic.ttf';
import GuardianTextSansBoldItalicWoff from '../fonts/text/GuardianTextSans-BoldItalic.woff';
import GuardianTextSansBoldItalicWoff2 from '../fonts/text/GuardianTextSans-BoldItalic.woff2';
import FrontsEdit from './FrontsEdit/Edit';
import Home from './Home';
import NotFound from './NotFound';
import {
	manageEditions,
	frontsEditPathProps,
	issuePathProps,
	frontsFeatureProps,
} from 'routes/routes';
import ManageView from './Editions/ManageView';
import FeaturesView from './Features/FeaturesView';
import { PlaceholderAnimation } from 'components/BasePlaceholder';
import OptionsModal from './modals/OptionsModal';
import BannerNotification from './notifications/BannerNotification';

// tslint:disable:no-unused-expression
// NB the properties described in font-face work as matchers, assigning text to the font imported by the source.
// this is why we have 2 declarations of font-weight in several of these font-faces. Assigning either hits this font.
const AppFonts = createGlobalStyle`
  @font-face {
    font-family: GHGuardianHeadline;
    src: url(${GHGuardianHeadlineBoldWoff2}) format('woff2'),
      url(${GHGuardianHeadlineBoldWoff}) format('woff'),
      url(${GHGuardianHeadlineBoldTtf}) format('truetype');
    font-weight: bold;
    font-weight: 700;
  }

  @font-face {
    font-family: GHGuardianHeadline;
    src: url(${GHGuardianHeadlineRegularWoff2}) format('woff2'),
      url(${GHGuardianHeadlineRegularWoff}) format('woff'),
      url(${GHGuardianHeadlineRegularTtf}) format('truetype');
    font-style: normal;
    font-weight: 400;
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
    src: url(${GuardianTextSansRegularWoff2}) format('woff2'),
      url(${GuardianTextSansRegularWoff}) format('woff'),
      url(${GuardianTextSansRegularTtf}) format('truetype');
    font-style: normal;
    font-weight: 400;
  }

  @font-face {
    font-family: TS3TextSans;
    src: url(${GuardianTextSansBoldWoff2}) format('woff2'),
      url(${GuardianTextSansTtfBold}) format('truetype'),
      url(${GuardianTextSansBoldWoff}) format('woff');
    font-weight: bold;
    font-weight: 700;
  }

  @font-face {
    font-family: TS3TextSans;
    src: url(${GuardianTextSansRegularItalicWoff2}) format('woff2'),
      url(${GuardianTextSansRegularItalicTtf}) format('truetype'),
      url(${GuardianTextSansRegularItalicWoff}) format('woff');
    font-style: italic;
    font-weight: normal;
    font-weight: 400;
  }

  @font-face {
    font-family: TS3TextSans;
    src: url(${GuardianTextSansBoldItalicWoff2}) format('woff2'),
      url(${GuardianTextSansBoldItalicTtf}) format('truetype'),
      url(${GuardianTextSansBoldItalicWoff}) format('woff');
    font-style: italic;
    font-weight: bold;
    font-weight: 700;
  }

  html, body {
    font-family: TS3TextSans, 'Helvetica Neue', Helvetica, Arial;
    font-size: 16px;
    font-weight: 100;
    -webkit-font-smoothing: antialiased;
  }

  input, textarea {
    font-family: TS3TextSans, 'Helvetica Neue', Helvetica, Arial;
  }

  a {
    color: ${theme.base.colors.text}
  }
`;

const AppContainer = styled.div`
	background-color: ${theme.base.colors.backgroundColorLight};
	position: relative;
	color: ${theme.base.colors.textDark};
	height: 100%;
	width: 100%;
`;

const BackgroundHeader = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
`;

const App = () => (
	<ThemeProvider theme={styleTheme}>
		<DropDisabler>
			<BannerNotification />
			<AppContainer>
				<BackgroundHeader>
					<SectionHeaderWithLogo greyHeader={true} />
				</BackgroundHeader>
				<Switch>
					<Route {...frontsEditPathProps} component={FrontsEdit} />
					<Route {...issuePathProps} component={FrontsEdit} />
					<Route {...frontsFeatureProps} component={FeaturesView} />
					<Route exact path="/" component={Home} />
					<Route exact path={manageEditions} component={ManageView} />
					<Route component={NotFound} />
				</Switch>
			</AppContainer>
			<PlaceholderAnimation />
			<AppFonts />
			<OptionsModal />
		</DropDisabler>
	</ThemeProvider>
);

export default App;
