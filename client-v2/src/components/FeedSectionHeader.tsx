import React from 'react';
import { withRouter } from 'react-router-dom';
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
  editorHideOpenFrontsMenu,
  createSelectEditorFrontsByPriority
} from 'bundles/frontsUIBundle';
import { Dispatch } from 'types/Store';
import FadeTransition from './transitions/FadeTransition';
import { MoreIcon } from 'shared/components/icons/Icons';
import { RouteComponentProps } from 'react-router';

const FeedbackButton = Button.extend<{
  href: string;
  target: string;
}>`
  margin-left: auto;
  align-self: center;
  padding-right: 10px;
  line-height: 60px;
  height: 60px;
`.withComponent('a');

const SectionHeaderContent = styled('div')`
  position: relative;
  flex: 1;
`;

const LogoContainer = styled('div')`
  background-color: ${({ theme }) => theme.shared.colors.greyMediumDark};
  position: relative;
  display: flex;
  vertical-align: top;
  cursor: pointer;
  z-index: 2;
  &:hover {
    background-color: ${({ theme }) => theme.shared.colors.greyMedium};
  }
`;

const LogoBackground = styled('div')<{ includeBorder?: boolean }>`
  display: flex;
  flex-direction: row;
  width: 60px;
  height: 60px;
  border-right: 1px solid
    ${({ theme, includeBorder }) =>
      includeBorder ? theme.shared.colors.greyMedium : 'transparent'};
`;

const Logo = styled('img')`
  margin: auto;
  width: 40px;
  height: 35px;
`;

const FrontCount = styled.div`
  position: absolute;
  display: inline-block;
  font-size: 20px;
  line-height: 60px;
  width: 100%;
  top: -6px;
  text-align: center;
  color: ${({ theme }) => theme.shared.colors.blackDark};
`;

const CloseButtonOuter = styled.div`
  margin: auto;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: solid 1px #ffffff;
`;

const CloseButtonInner = styled.div`
  transform: rotate(45deg);
  display: block;
  margin: 0 auto;
  width: 30px;
  height: 32px;
  top: 3px;
  position: relative;
`;

type ComponentProps = {
  toggleCurrentFrontsMenu: () => void;
  isCurrentFrontsMenuOpen: boolean;
  frontCount: number;
} & RouteComponentProps<{ priority: string }>;

type ContainerProps = RouteComponentProps<{ priority: string }>;

const FeedSectionHeader = ({
  toggleCurrentFrontsMenu,
  isCurrentFrontsMenuOpen,
  frontCount,
  match
}: ComponentProps) => (
  <SectionHeaderWithLogo includeBorder={!isCurrentFrontsMenuOpen}>
    <LogoContainer
      onClick={toggleCurrentFrontsMenu}
      title="Click to manage active fronts"
    >
      <LogoBackground includeBorder={isCurrentFrontsMenuOpen}>
        {!isCurrentFrontsMenuOpen ? (
          <>
            <Logo src={FrontsLogo} alt="The Fronts tool" />
            <FrontCount>{frontCount}</FrontCount>
          </>
        ) : (
          <CloseButtonOuter>
            <CloseButtonInner>
              <MoreIcon size="fill" />
            </CloseButtonInner>
          </CloseButtonOuter>
        )}
      </LogoBackground>
    </LogoContainer>
    <SectionHeaderContent>
      <FadeTransition active={isCurrentFrontsMenuOpen} direction="left">
        <CurrentFrontsList priority={match.params.priority} />
      </FadeTransition>
      <FadeTransition active={!isCurrentFrontsMenuOpen} direction="right">
        <FeedbackButton
          href="https://docs.google.com/forms/d/e/1FAIpQLSc4JF0GxrKoxQgsFE9_tQfjAo1RKRU4M5bJWJRKaVlHbR2rpA/viewform?c=0&w=1"
          target="_blank"
        >
          Send us feedback
        </FeedbackButton>
      </FadeTransition>
    </SectionHeaderContent>
  </SectionHeaderWithLogo>
);

const mapStateToProps = () => {
  const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
  return (state: State, props: ContainerProps) => ({
    isCurrentFrontsMenuOpen: selectIsCurrentFrontsMenuOpen(state),
    frontCount: selectEditorFrontsByPriority(state, {
      priority: props.match.params.priority
    }).length
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  toggleCurrentFrontsMenu: (menuState: boolean) =>
    menuState
      ? dispatch(editorShowOpenFrontsMenu())
      : dispatch(editorHideOpenFrontsMenu())
});

const mergeProps = (
  stateProps: ReturnType<ReturnType<typeof mapStateToProps>>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>,
  ownProps: ContainerProps
) => ({
  ...stateProps,
  ...ownProps,
  toggleCurrentFrontsMenu: () =>
    dispatchProps.toggleCurrentFrontsMenu(!stateProps.isCurrentFrontsMenuOpen)
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(FeedSectionHeader)
);