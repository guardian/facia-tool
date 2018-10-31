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
    index: number;
    onDrop: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    style: React.CSSProperties;
    indicatorStyle: React.CSSProperties;
    override?: boolean;
  },
  { isHoveredOver: boolean }
> {
  public static defaultProps = {
    style: {},
    indicatorStyle: {}
  };
  public state = {
    isHoveredOver: false
  };

  get isActive() {
    return typeof this.props.override === 'boolean'
      ? this.props.override
      : this.state.isHoveredOver;
  }

  public handleDragEnter = (e: React.DragEvent) => {
    this.props.onDragEnter(e);
    this.setState({ isHoveredOver: true });
  };

  public handleDragLeave = () => {
    this.setState({ isHoveredOver: false });
  };

  public handleDrop = (e: React.DragEvent<HTMLElement>) => {
    this.setState({ isHoveredOver: false });
    return this.props.onDrop(e);
  };

  public render() {
    const { onDragOver, style, index } = this.props;
    return (
      <DropContainer
        data-testid={`drop-zone:${index}`}
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
