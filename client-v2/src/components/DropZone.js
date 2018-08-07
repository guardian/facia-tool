import React from 'react';
import styled from 'styled-components';

const DropContainerWithHover = styled('div')`
  background-color: #d4d4d4;
  height: 20px;
`;

const DropContainer = styled('div')`
  background-color: #e4e4e4;
  height: 20px;
`;

class DropZone extends React.Component<{
  onDrop: () => void
}> {
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
    this.props.onDrop(e);
  };

  render() {
    const Container = this.state.isHoveredOver
      ? DropContainerWithHover
      : DropContainer;
    return (
      <Container
        {...this.props}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDragExit={this.handleDragLeave}
        onDrop={this.handleDrop}
      />
    );
  }
}

export default DropZone;
