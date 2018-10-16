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
    onDrop: (e: React.DragEvent<HTMLElement>) => void,
    onDragOver: (e: React.DragEvent<HTMLElement>) => void,
    style: React.CSSProperties,
    indicatorStyle: React.CSSProperties,
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

  get isActive() {
    return typeof this.props.override === 'boolean'
      ? this.props.override
      : this.state.isHoveredOver;
  }

  handleDragEnter = () => {
    this.setState({ isHoveredOver: true });
  };

  handleDragLeave = () => {
    this.setState({ isHoveredOver: false });
  };

  handleDrop = (e: React.DragEvent<HTMLElement>) => {
    this.setState({ isHoveredOver: false });
    return this.props.onDrop(e);
  };

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
            zIndex: this.isActive ? 1 : undefined,
            backgroundColor: this.isActive ? 'rgba(199, 0, 0)' : undefined
          }}
        />
      </DropContainer>
    );
  }
}

export default DropZone;
