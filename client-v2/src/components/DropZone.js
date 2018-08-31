// @flow

import React from 'react';
import styled from 'styled-components';

const DropContainer = styled('div')`
  position: relative;
  height: 15px;
`;

const DropIndicator = styled('div')`
  height: 100%;
  pointer-events: none;
`;

class DropZone extends React.Component<
  {
    onDrop: (e: DragEvent) => void,
    onDragOver: (e: DragEvent) => void,
    style: Object,
    indicatorStyle: Object,
    override?: boolean
  },
  { isHoveredOver: boolean }
> {
  static defaultProps = {
    style: {},
    indicatorStyle: {}
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

  handleDrop = (e: DragEvent) => {
    this.setState({ isHoveredOver: false });
    return this.props.onDrop(e);
  };

  get isActive() {
    return typeof this.props.override === 'boolean'
      ? this.props.override
      : this.state.isHoveredOver;
  }

  render() {
    const { onDragOver, style } = this.props;
    return (
      <DropContainer
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDragExit={this.handleDragLeave}
        onDrop={this.handleDrop}
        onDragOver={onDragOver}
        style={style}
      >
        <DropIndicator
          style={{
            ...this.props.indicatorStyle,
            zIndex: this.isActive ? 1 : null,
            backgroundColor: this.isActive ? 'rgba(199, 0, 0)' : null
          }}
        />
      </DropContainer>
    );
  }
}

export default DropZone;
