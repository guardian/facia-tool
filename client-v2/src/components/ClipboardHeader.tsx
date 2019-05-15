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

interface ClipboardHeaderProps {
  isClipboardOpen: boolean;
  toggleClipboard: (open: boolean) => void;
}

const Header = styled.div`
  align-items: center;
  justify-content: space-between;
  border-bottom: ${({ theme }) =>
    `1px solid ${theme.shared.base.colors.borderColor}`};
  display: flex;
  padding: 10px;
`;

const ClipboardTitle = styled.h2`
  font-size: 14px;
  line-height: 1;
  margin: 0;
`;

class ClipboardHeader extends React.Component<ClipboardHeaderProps> {
  public state = {
    preActive: false
  };
  public render() {
    return (
      <Header>
        {this.props.isClipboardOpen && (
          <ClipboardTitle>Clipboard</ClipboardTitle>
        )}
        <ButtonCircularCaret
          tabIndex={-1}
          openDir="right"
          active={this.props.isClipboardOpen}
          preActive={this.state.preActive}
          onClick={() =>
            this.props.toggleClipboard(!this.props.isClipboardOpen)
          }
        />
      </Header>
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
