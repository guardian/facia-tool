import React from 'react';
import { styled } from 'constants/theme';
import { theme } from 'constants/theme';

const DropContainer = styled('div')<{
  disabled: boolean;
  doubleHeight?: boolean;
  isActive: boolean;
}>`
  position: relative;
  height: ${({ doubleHeight }) => (doubleHeight ? '20px' : '10px')};
  ${({ disabled }) => disabled && 'pointer-events: none'};
  ${({ isActive }) => `z-index: ${isActive ? 1 : 1}`}
`;

const DropIndicator = styled(`div`)`
  display: flex;
  flex-direction: row;
  height: 20px;
`;

const DropIndicatorBar = styled('div')`
  position: relative;
  height: 8px;
  width: 100%;
  top: 6px;
  margin-left: -5px;
`;

const DropIndicatorMessage = styled(`div`)`
  flex: 1 0 60px;
  border-radius: 10px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-family: TS3TextSans;
  font-size: 10px;
  color: white;
`;

class DropZone extends React.Component<
  {
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    disabled?: boolean;
    doubleHeight?: boolean;
    style: React.CSSProperties;
    indicatorStyle: React.CSSProperties;
    override?: boolean;
    dropColor?: string;
    dropMessage?: string;
  },
  { isHoveredOver: boolean }
> {
  public static defaultProps = {
    style: {},
    indicatorStyle: {},
    dropColor: theme.base.colors.dropZone,
    dropMessage: 'Place here'
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
    const { style, doubleHeight } = this.props;
    return (
      <DropContainer
        {...this.getEventProps()}
        doubleHeight={doubleHeight}
        data-testid="drop-zone"
        style={style}
        disabled={!!this.props.disabled}
        isActive={this.isActive}
      >
        {this.isActive && (
          <DropIndicator
            style={{
              ...this.props.indicatorStyle
            }}
          >
            <DropIndicatorMessage
              style={{ backgroundColor: this.props.dropColor }}
            >
              <div>{this.props.dropMessage}</div>
            </DropIndicatorMessage>
            <DropIndicatorBar
              style={{
                backgroundColor: this.props.dropColor
              }}
            />
          </DropIndicator>
        )}
      </DropContainer>
    );
  }
}

export default DropZone;
