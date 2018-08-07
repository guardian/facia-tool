import React from 'react';
import styled from 'styled-components';

const DropContainer = styled('div')`
  position: relative;
  height: 15px;
  z-index: 1;
`;

class DropZone extends React.Component<{
  onDrop: () => void,
  hoist?: boolean,
  color?: string
}> {
  static defaultProps = {
    // Hoisting the dropzone applies a negative margin
    // to pull it up into its parent.
    hoist: false,
    color: 'rgba(0,0,0,0.2)'
  };
  state = {
    isHoveredOver: false
  };

  handleDragEnter = () => {
    this.setState({ isHoveredOver: true });
  };

  handleDragLeave = () => {
    this.setState({ isHoveredOver: false });
  };

  handleDrop = e => {
    this.setState({ isHoveredOver: false });
    return this.props.onDrop(e);
  };

  render() {
    return (
      <DropContainer
        {...this.props}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDragExit={this.handleDragLeave}
        onDrop={this.handleDrop}
        style={{
          backgroundColor: this.state.isHoveredOver ? this.props.color : null,
          marginTop: this.props.hoist ? '-15px' : null
        }}
      />
    );
  }
}

export default DropZone;
