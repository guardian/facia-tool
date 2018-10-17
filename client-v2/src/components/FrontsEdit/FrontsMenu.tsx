import React from 'react';
import styled from 'styled-components';

import FadeIn from 'shared/components/animation/FadeIn';
import MoreImage from 'shared/images/icons/more.svg';
import LargeSectionHeader from '../layout/LargeSectionHeader';
import ButtonOverlay from '../inputs/ButtonOverlay';
import ScrollContainer from '../ScrollContainer';
import Overlay from '../layout/Overlay';
import FrontsList from '../../containers/FrontsList';

const FrontsMenuContent = styled('div')`
  flex: 1;
  padding: 0 20px;
`;

const FrontsMenuItems = styled('div')`
  padding-left: 10px;
`;

const FrontsMenuHeading = LargeSectionHeader.extend`
  padding: 10px;
  margin: 0 10px 10px;
  border-bottom: solid 1px #5e5e5e;
`;

const FrontsMenuSubHeading = styled('div')`
  padding: 10px 0;
  font-size: 16px;
  font-weight: bold;
  line-height: 20px;
  border-bottom: solid 1px #5e5e5e;
  max-height: 100%;
`;

const ButtonOverlayContainer = styled('div')`
  position: absolute;
  left: -80px;
  bottom: 30px;
`;

const FrontsMenuContainer = styled('div')<{ isOpen?: boolean}>`
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

interface Props {
  onSelectFront: (frontId: string) => void
}

interface State {
  isOpen: boolean
}

class FrontsMenu extends React.Component<Props, State> {
  public state = {
    isOpen: false
  };

  public onSelectFront = (frontId: string) => {
    this.toggleFrontsMenu();
    this.props.onSelectFront(frontId);
  };

  public toggleFrontsMenu = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  public render() {
    return (
      <React.Fragment>
        {this.state.isOpen && (
          <FadeIn>
            <Overlay />
          </FadeIn>
        )}
        <FrontsMenuContainer isOpen={this.state.isOpen}>
          <ButtonOverlayContainer>
            <ButtonOverlay
              onClick={this.toggleFrontsMenu}
              active={this.state.isOpen}
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
                <FrontsList onSelect={this.onSelectFront} />
              </FrontsMenuItems>
            </FrontsMenuContent>
          </ScrollContainer>
        </FrontsMenuContainer>
      </React.Fragment>
    );
  }
}

export default FrontsMenu;
