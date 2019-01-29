import React from 'react';
import { styled } from 'constants/theme';
import FadeIn from 'shared/components/animation/FadeIn';
import MoreImage from 'shared/images/icons/more.svg';
import LargeSectionHeader from '../layout/LargeSectionHeader';
import ButtonOverlay from '../inputs/ButtonOverlay';
import ScrollContainer from '../ScrollContainer';
import Overlay from '../layout/Overlay';
import FrontsList from '../../containers/FrontsList';
import Row from 'components/Row';
import Col from 'components/Col';
import searchImage from 'shared/images/icons/search.svg';

const FrontsMenuContent = styled('div')`
  flex: 1;
  padding: 0 20px;
`;

const FrontsMenuHeading = LargeSectionHeader.extend`
  padding: 10px;
  margin: 0 10px 10px;
  border-bottom: solid 1px #5e5e5e;
`;

const FrontsMenuSubHeading = styled('div')`
  position: relative;
  padding: 10px 0;
  font-size: 16px;
  line-height: 30px;
  font-weight: bold;
  border-bottom: solid 1px #5e5e5e;
  max-height: 100%;
`;

const ButtonOverlayContainer = styled('div')`
  position: absolute;
  left: -80px;
  bottom: 30px;
`;

const FrontsMenuContainer = styled('div')<{ isOpen?: boolean }>`
  z-index: 100;
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

const FrontsMenuSearchInputContainer = Col.extend`
  position: relative;
`;

const FrontsMenuSearchInput = styled('input')`
  background-color: rgba(0, 0, 0, 0.2);
  height: 30px;
  width: 100%;
  padding: 5px;
  padding-right: 20px;
  border: 0;
  color: white;
  font-size: 16px;
  :active,
  :focus {
    outline: none;
  }
`;

const FrontsMenuSearchImage = styled('img')`
  position: absolute;
  right: 5px;
  top: 0;
`;

interface Props {
  onSelectFront: (frontId: string) => void;
}

interface State {
  isOpen: boolean;
  searchString: string;
}

class FrontsMenu extends React.Component<Props, State> {
  public state = {
    isOpen: false,
    searchString: ''
  };
  public inputRef = React.createRef<HTMLInputElement>();

  public onSelectFront = (frontId: string) => {
    this.toggleFrontsMenu();
    this.props.onSelectFront(frontId);
  };

  public onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target || !(event.target instanceof HTMLInputElement)) {
      return;
    }
    this.setState({
      searchString: event.target.value
    });
  };

  public toggleFrontsMenu = () => {
    if (!this.state.isOpen && this.inputRef.current) {
      this.inputRef.current.focus();
    }
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  public render() {
    return (
      <>
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
              <FrontsMenuSubHeading>
                <Row>
                  <Col>All</Col>
                  <FrontsMenuSearchInputContainer>
                    <FrontsMenuSearchInput
                      value={this.state.searchString}
                      onChange={this.onInput}
                      innerRef={this.inputRef}
                    />
                    <FrontsMenuSearchImage
                      src={searchImage}
                      alt="Search fronts"
                    />
                  </FrontsMenuSearchInputContainer>
                </Row>
              </FrontsMenuSubHeading>
              <FrontsList
                onSelect={this.onSelectFront}
                searchString={this.state.searchString}
              />
            </FrontsMenuContent>
          </ScrollContainer>
        </FrontsMenuContainer>
      </>
    );
  }
}

export default FrontsMenu;
