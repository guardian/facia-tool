// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { fetchClipboardContent } from 'actions/Clipboard';
import { type State } from 'types/State';

type ClipboardPropsBeforeState = {};

type ClipboardProps = ClipboardPropsBeforeState & {
  fetchClipboardContent: () => Promise<Array<string>>,
  clipboardContent: Array<string>
};

const Container = styled(`div`)`
  display: flex;
  flex: 1;
  flex-direction: column;
`;
class Clipboard extends React.Component<ClipboardProps> {
  componentDidMount() {
    this.props.fetchClipboardContent();
  }

  render() {
    return <Container>Clipboard</Container>;
  }
}

const mapStateToProps = (state: State) => ({
  clipboardContent: state.clipboard
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ fetchClipboardContent }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Clipboard);
