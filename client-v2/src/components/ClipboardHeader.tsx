import React from 'react';
import { Dispatch } from 'types/Store';
import { connect } from 'react-redux';
import {
  selectIsClipboardOpen,
  editorOpenClipboard,
  editorCloseClipboard
} from 'bundles/frontsUIBundle';
import { State } from 'types/State';
import { styled } from 'constants/theme';
import ButtonCircularCaret from 'shared/components/input/ButtonCircularCaret';
import DragIntentContainer from 'shared/components/DragIntentContainer';

interface ClipboardHeaderProps {
  isClipboardOpen: boolean;
  toggleClipboard: (open: boolean) => void;
}

const StyledDragIntentContainer = styled(DragIntentContainer)`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const Header = styled.div`
  align-items: center;
  justify-content: space-between;
  border-right: none;
  border: ${({ theme }) =>
    `1px solid ${theme.shared.base.colors.borderColor}`};
  display: flex;
  padding: 10px;
  height: 52px;
  width: 100%;
  margin-left: 8px;
`;

const ClipboardTitle = styled.h2`
  font-size: 12px;
  line-height: 1;
  margin: 0;
`;

class ClipboardHeader extends React.Component<ClipboardHeaderProps> {
  public state = {
    preActive: false
  };
  public render() {
    return (
      <StyledDragIntentContainer
        active={!this.props.isClipboardOpen}
        delay={300}
        onDragIntentStart={() => this.setState({ preActive: true })}
        onDragIntentEnd={() => this.setState({ preActive: false })}
        onIntentConfirm={() => this.props.toggleClipboard(true)}
      >
        <Header>
          <ClipboardTitle>Clipboard</ClipboardTitle>
          <ButtonCircularCaret
            openDir="right"
            active={this.props.isClipboardOpen}
            preActive={this.state.preActive}
            onClick={() =>
              this.props.toggleClipboard(!this.props.isClipboardOpen)
            }
            small={true}
          />
        </Header>
      </StyledDragIntentContainer>
    );
  }
}

const mapStateToProps = (state: State) => ({
  isClipboardOpen: selectIsClipboardOpen(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  toggleClipboard: (open: boolean) =>
    dispatch(open ? editorOpenClipboard() : editorCloseClipboard())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClipboardHeader);
