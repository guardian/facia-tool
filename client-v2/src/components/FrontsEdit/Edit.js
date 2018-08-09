// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import type { Match, RouterHistory } from 'react-router-dom';
import styled from 'styled-components';

import FadeIn from 'shared/components/animation/FadeIn';
import FrontsMenu from 'containers/FrontsMenu';
import type { State } from 'types/State';
import type { ActionError } from 'types/Action';
import MoreImage from 'shared/images/icons/more.svg';
import FrontsLayout from '../FrontsLayout';
import FrontsContainer from './FrontsContainer';
import Feed from '../Feed';
import ErrorBannner from '../ErrorBanner';
import Clipboard from '../Clipboard';
import ButtonOverlay from '../inputs/ButtonOverlay';
import Overlay from '../layout/Overlay';
import LargeSectionHeader from '../layout/LargeSectionHeader';

type Props = {
  match: Match,
  error: ActionError,
  history: RouterHistory
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
  position: absolute;
  height: 100%;
  width: 390px;
  top: 0;
  right: 0;
  padding: 0 20px 20px;
  color: #fff;
  transition: transform 0.15s;
  transform: ${({ isOpen }) =>
    isOpen ? 'translate3d(0px, 0, 0)' : 'translate3d(390px, 0, 0)'};
`;

const FrontsMenuHeading = LargeSectionHeader.extend`
  padding: 10px 0;
  border-bottom: solid 1px #5e5e5e;
  margin-bottom: 10px;
`;

const FrontsMenuSubHeading = styled('div')`
  padding: 10px 0;
  font-size: 16px;
  font-weight: bold;
  line-height: 20px;
  border-bottom: solid 1px #5e5e5e;
`;

const getFrontId = (frontId: ?string): string =>
  frontId ? decodeURIComponent(frontId) : '';

class FrontsEdit extends React.Component<
  Props,
  {
    isFrontsMenuOpen: boolean
  }
> {
  state = {
    isFrontsMenuOpen: false
  };

  toggleFrontsMenu = () => {
    this.setState({
      isFrontsMenuOpen: !this.state.isFrontsMenuOpen
    });
  };

  addFrontAndCloseMenu = (frontId: string) => {
    this.toggleFrontsMenu();
  };

  render() {
    return (
      <FrontsEditContainer>
        <ErrorBannner error={this.props.error} />
        <FrontsLayout
          left={<Feed />}
          middle={<Clipboard />}
          right={
            <FrontsContainer
              history={this.props.history}
              priority={this.props.match.params.priority || ''}
              frontId={getFrontId(this.props.match.params.frontId)}
            />
          }
        />
        {this.state.isFrontsMenuOpen && (
          <FadeIn>
            <Overlay />
          </FadeIn>
        )}
        <FrontsMenuContainer isOpen={this.state.isFrontsMenuOpen}>
          <ButtonOverlayContainer>
            <ButtonOverlay
              onClick={this.toggleFrontsMenu}
              active={this.state.isFrontsMenuOpen}
            >
              <img src={MoreImage} alt="" width="100%" height="100%" />
            </ButtonOverlay>
          </ButtonOverlayContainer>
          <FrontsMenuHeading>Add Front</FrontsMenuHeading>
          <FrontsMenuSubHeading>All</FrontsMenuSubHeading>
          <FrontsMenu onSelect={this.addFrontAndCloseMenu} />
        </FrontsMenuContainer>
      </FrontsEditContainer>
    );
  }
}

const mapStateToProps = (state: State) => ({
  error: state.error
});

export default connect(mapStateToProps)(FrontsEdit);
