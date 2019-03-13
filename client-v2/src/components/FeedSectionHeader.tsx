import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import SectionHeaderWithLogo from './layout/SectionHeaderWithLogo';
import CurrentFrontsList from './CurrentFrontsList';
import FrontsLogo from 'images/icons/fronts-logo.svg';
import Button from 'shared/components/input/ButtonDefault';
import { State } from 'types/State';
import {
  selectIsCurrentFrontsMenuOpen,
  editorShowOpenFrontsMenu,
  editorHideOpenFrontsMenu
} from 'bundles/frontsUIBundle';
import { Dispatch } from 'types/Store';
import FadeOnMountTransition from './transitions/FadeOnMountTransition';

const FeedbackButton = Button.extend<{
  href: string;
  target: string;
}>`
  margin-left: auto;
  align-self: center;
  margin-right: 10px;
  line-height: 24px;
`.withComponent('a');

const SectionHeaderContent = styled('div')`
  position: relative;
  // overflow: hidden;
  flex: 1;
`;

const LogoContainer = styled('div')`
  background-color: ${({ theme }) => theme.shared.colors.greyMediumDark};
  position: relative;
  display: flex;
  vertical-align: top;
  cursor: pointer;
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

interface Props {
  toggleCurrentFrontsMenu: () => void;
  isCurrentFrontsMenuOpen: boolean;
}

const FeedSectionHeader = ({
  toggleCurrentFrontsMenu,
  isCurrentFrontsMenuOpen
}: Props) => (
  <SectionHeaderWithLogo>
    <LogoContainer onClick={toggleCurrentFrontsMenu}>
      <LogoBackground>
        <Logo src={FrontsLogo} alt="The Fronts tool" />
      </LogoBackground>
    </LogoContainer>
    <SectionHeaderContent>
      <FadeOnMountTransition active={isCurrentFrontsMenuOpen} direction="left">
        <CurrentFrontsList />
      </FadeOnMountTransition>
      <FadeOnMountTransition
        active={!isCurrentFrontsMenuOpen}
        direction="right"
      >
        <FeedbackButton
          href="https://docs.google.com/forms/d/e/1FAIpQLSc4JF0GxrKoxQgsFE9_tQfjAo1RKRU4M5bJWJRKaVlHbR2rpA/viewform?c=0&w=1"
          target="_blank"
        >
          Send us feedback
        </FeedbackButton>
      </FadeOnMountTransition>
    </SectionHeaderContent>
  </SectionHeaderWithLogo>
);

const mapStateToProps = (state: State) => ({
  isCurrentFrontsMenuOpen: selectIsCurrentFrontsMenuOpen(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  toggleCurrentFrontsMenu: (menuState: boolean) =>
    menuState
      ? dispatch(editorShowOpenFrontsMenu())
      : dispatch(editorHideOpenFrontsMenu())
});

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>
) => ({
  ...stateProps,
  toggleCurrentFrontsMenu: () =>
    dispatchProps.toggleCurrentFrontsMenu(!stateProps.isCurrentFrontsMenuOpen)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(FeedSectionHeader);
