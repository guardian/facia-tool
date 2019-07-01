import React from 'react';
import { styled } from 'constants/theme';
import { theme } from 'constants/theme';

export const DropContainer = styled('div')<{
  disabled: boolean;
  doubleHeight?: boolean;
  isActive: boolean;
}>`
  position: relative;
  height: ${({ doubleHeight }) => (doubleHeight ? '20px' : '10px')};
  ${({ disabled }) => disabled && 'pointer-events: none'};
  ${({ isActive }) => `z-index: ${isActive ? 1 : 1}`}
`;

export const DropIndicator = styled(`div`)<{ isActive: boolean }>`
  display: flex;
  flex-direction: row;
  height: 20px;
  opacity: 0;
  ${({ isActive }) =>
    isActive &&
    `
  z-index: 1;
  opacity: 1;
  `}
`;

export const DropIndicatorBar = styled('div')<{
  color?: string;
  isActive: boolean;
}>`
  position: relative;
  height: 8px;
  width: 100%;
  top: 6px;
  margin-left: -5px;
  ${({ color, isActive }) =>
    `background-color: ${
      isActive ? color : theme.shared.colors.greyMediumLight
    } !important`}
`;

export const DropIndicatorMessage = styled(`div`)<{
  color?: string;
  isActive: boolean;
}>`
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
  ${({ color, isActive }) =>
    `background-color: ${
      isActive ? color : theme.shared.colors.greyMediumLight
    } !important`}
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
    const {
      style,
      doubleHeight,
      dropColor,
      indicatorStyle,
      disabled,
      dropMessage
    } = this.props;
    return (
      <DropContainer
        {...this.getEventProps()}
        doubleHeight={doubleHeight}
        data-testid="drop-zone"
        style={style}
        disabled={!!disabled}
        isActive={this.isActive}
      >
        <DropIndicator
          style={{
            ...indicatorStyle
          }}
          isActive={this.isActive}
        >
          <DropIndicatorMessage isActive={this.isActive} color={dropColor}>
            <div>{dropMessage}</div>
          </DropIndicatorMessage>
          <DropIndicatorBar isActive={this.isActive} color={dropColor} />
        </DropIndicator>
      </DropContainer>
    );
  }
}

export default DropZone;
