// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Match, RouterHistory } from 'react-router-dom';
import styled from 'styled-components';

import getFrontsConfig from 'actions/Fronts';
import { editorAddFront, selectEditorFronts } from 'bundles/frontsUIBundle';
import FadeIn from 'shared/components/animation/FadeIn';
import FrontsMenu from 'containers/FrontsMenu';
import type { State } from 'types/State';
import type { ActionError } from 'types/Action';
import MoreImage from 'shared/images/icons/more.svg';
import FrontContainer from './FrontContainer';
import FeedSection from '../FeedSection';
import ErrorBannner from '../ErrorBanner';
import ButtonOverlay from '../inputs/ButtonOverlay';
import Overlay from '../layout/Overlay';
import LargeSectionHeader from '../layout/LargeSectionHeader';
import ScrollContainer from '../ScrollContainer';
import SectionContainer from '../layout/SectionContainer';
import SectionsContainer from '../layout/SectionsContainer';

type Props = {
  match: Match,
  error: ActionError,
  history: RouterHistory,
  frontIds: string[],
  editorAddFront: (frontId: string) => void,
  getFrontsConfig: () => void
};

const FrontsEditContainer = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const ButtonOverlayContainer = styled('div')`
  position: absolute;
  left: -80px;
  bottom: 30px;
`;

const FrontsMenuContainer = styled('div')`
  background-color: #333;
  position: fixed;
  height: 100%;
  width: 390px;
  top: 0;
  right: 0;
  color: #fff;
  transition: transform 0.15s;
  transform: ${({ isOpen }) =>
    isOpen ? 'translate3d(0px, 0, 0)' : 'translate3d(390px, 0, 0)'};
`;

const FrontsMenuHeading = LargeSectionHeader.extend`
  padding: 10px;
  border-bottom: solid 1px #5e5e5e;
  margin-bottom: 10px;
`;

const FrontsMenuSubHeading = styled('div')`
  padding: 10px 0;
  font-size: 16px;
  font-weight: bold;
  line-height: 20px;
  border-bottom: solid 1px #5e5e5e;
  max-height: 100%;
`;

const FloatedFrontContainer = styled('div')`
  float: left;
  height: 100%;
  width: 1011px;
`;

const FrontsMenuContent = styled('div')`
  flex: 1;
  padding: 0 20px;
`;

const FrontsMenuItems = styled('div')`
  padding-left: 10px;
`;

const FeedContainer = SectionContainer.extend`
  height: 100%;
`;

class FrontsEdit extends React.Component<
  Props,
  {
    isFrontsMenuOpen: boolean
  }
> {
  state = {
    isFrontsMenuOpen: false
  };

  componentWillMount() {
    this.props.getFrontsConfig();
  }

  toggleFrontsMenu = () => {
    this.setState({
      isFrontsMenuOpen: !this.state.isFrontsMenuOpen
    });
  };

  addFrontAndCloseMenu = (frontId: string) => {
    this.toggleFrontsMenu();
    this.props.editorAddFront(frontId);
  };

  render() {
    return (
      <FrontsEditContainer>
        <ErrorBannner error={this.props.error} />
        <SectionsContainer>
          <FeedContainer>
            <FeedSection />
          </FeedContainer>
          <SectionContainer>
            {this.props.frontIds.map(frontId => (
              <FloatedFrontContainer key={frontId}>
                <FrontContainer
                  key={frontId}
                  history={this.props.history}
                  priority={this.props.match.params.priority || ''}
                  frontId={frontId}
                />
              </FloatedFrontContainer>
            ))}
          </SectionContainer>
          {this.state.isFrontsMenuOpen && (
            <FadeIn>
              <Overlay />
            </FadeIn>
          )}
        </SectionsContainer>
        <FrontsMenuContainer isOpen={this.state.isFrontsMenuOpen}>
          <ButtonOverlayContainer>
            <ButtonOverlay
              onClick={this.toggleFrontsMenu}
              active={this.state.isFrontsMenuOpen}
            >
              <img src={MoreImage} alt="" width="100%" height="100%" />
            </ButtonOverlay>
          </ButtonOverlayContainer>
          <ScrollContainer
            fixed={<FrontsMenuHeading>Add Front</FrontsMenuHeading>}
          >
            <FrontsMenuContent>
              <FrontsMenuSubHeading>All</FrontsMenuSubHeading>
              <FrontsMenuItems>
                <FrontsMenu onSelect={this.addFrontAndCloseMenu} />
              </FrontsMenuItems>
            </FrontsMenuContent>
          </ScrollContainer>
        </FrontsMenuContainer>
      </FrontsEditContainer>
    );
  }
}

const mapStateToProps = (state: State) => ({
  error: state.error,
  frontIds: selectEditorFronts(state)
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      editorAddFront,
      getFrontsConfig
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontsEdit);
