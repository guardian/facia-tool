import React from 'react';
import { styled } from 'constants/theme';
import { theme } from 'constants/theme';

const DropContainer = styled('div')`
  position: relative;
  height: 10px;
`;

const DropIndicator = styled('div')`
  position: relative;
  height: 100%;
  pointer-events: none;
`;

class DropZone extends React.Component<
  {
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    disabled?: boolean;
    style: React.CSSProperties;
    indicatorStyle: React.CSSProperties;
    override?: boolean;
    dropColor?: string;
  },
  { isHoveredOver: boolean }
> {
  public static defaultProps = {
    style: {},
    indicatorStyle: {},
    dropColor: theme.base.colors.dropZone
  };

  public state = {
    isHoveredOver: false
  };

  get isActive() {
    return !!this.props.disabled
      ? false
      : typeof this.props.override === 'boolean'
      ? this.props.override
      : this.state.isHoveredOver;
  }

  public handleDragEnter = (e: React.DragEvent) => {
    this.setState({ isHoveredOver: true });
  };

  public handleDragLeave = () => {
    this.setState({ isHoveredOver: false });
  };

  public handleDrop = (e: React.DragEvent<HTMLElement>) => {
    this.setState({ isHoveredOver: false });
    return this.props.onDrop(e);
  };

  public getEventProps = () =>
    this.props.disabled
      ? {}
      : {
          onDragEnter: this.handleDragEnter,
          onDragLeave: this.handleDragLeave,
          onDragExit: this.handleDragLeave,
          onDrop: this.handleDrop,
          onDragOver: this.props.onDragOver
        };

  public render() {
    const { style } = this.props;
    return (
      <DropContainer
        {...this.getEventProps()}
        data-testid="drop-zone"
        style={style}
      >
        <DropIndicator
          style={{
            ...this.props.indicatorStyle,
            zIndex: this.isActive ? 1 : undefined,
            backgroundColor: this.isActive ? this.props.dropColor : undefined
          }}
        />
      </DropContainer>
    );
  }
}

export default DropZone;
