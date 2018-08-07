import React from 'react';
import styled from 'styled-components';

const DropContainer = styled('div')`
  background-color: #f4f4f4;
  height: 20px;
  border-top: 4px solid #f4f4f4;
  border-bottom: 4px solid #f4f4f4;
`;

const DropContainerWithHover = styled(DropContainer)`
  background-color: #d4d4d4;
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
    return this.props.onDrop(e);
  };

  render() {
    const Container = this.state.isHoveredOver
      ? DropContainerWithHover
      : DropContainer;
    return (
      <Container
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDragExit={this.handleDragLeave}
        onDrop={this.handleDrop}
        {...this.props}
      />
    );
  }
}

export default DropZone;
