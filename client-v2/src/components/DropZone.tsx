import React from 'react';
import { styled } from 'constants/theme';
import { theme } from 'constants/theme';

export const DefaultDropContainer = styled.div<{
  disabled: boolean;
  doubleHeight?: boolean;
  isActive?: boolean;
}>`
  position: relative;
  height: ${({ doubleHeight }) => (doubleHeight ? '20px' : '8px')};
  ${({ disabled }) => disabled && 'pointer-events: none'};
  ${({ isActive }) => `z-index: ${isActive ? 1 : 1}`}
`;

export const DefaultDropIndicator = styled.div<{ isActive?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  height: 8px;
  opacity: 0;
  ${({ isActive }) =>
    isActive &&
    `
  z-index: 1;
  opacity: 1;
  `}
`;

export const DropIndicatorBar = styled.div<{
  color?: string;
  isActive?: boolean;
}>`
  position: relative;
  height: 8px;
  width: 100%;
  margin-left: 5px;
  ${({ color, isActive }) =>
    `background-color: ${
      isActive ? color : theme.shared.colors.greyVeryLight
    } !important`}
`;

export const DropIndicatorMessage = styled.div<{
  color?: string;
  isActive?: boolean;
}>`
  position: absolute;
  padding: 0 10px;
  border-radius: 10px;
  height: 20px;
  line-height: 20px;
  top: -5px;
  font-weight: bold;
  font-family: TS3TextSans;
  font-size: 10px;
  color: white;
  ${({ color, isActive }) =>
    `background-color: ${
      isActive ? color : theme.shared.colors.greyVeryLight
    } !important`}
`;

class DropZone extends React.Component<
  {
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    disabled?: boolean;
    doubleHeight?: boolean;
    override?: boolean;
    dropColor?: string;
    dropMessage?: string;
    dropContainer?: React.ComponentType<any>;
    dropIndicator?: React.ComponentType<any>;
  },
  { isHoveredOver: boolean }
> {
  public static defaultProps = {
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
      doubleHeight,
      dropColor,
      disabled,
      dropMessage,
      dropContainer: DropContainer = DefaultDropContainer,
      dropIndicator: DropIndicator = DefaultDropIndicator
    } = this.props;
    return (
      <DropContainer
        {...this.getEventProps()}
        doubleHeight={doubleHeight}
        data-testid="drop-zone"
        disabled={!!disabled}
        isActive={this.isActive}
      >
        <DropIndicator isActive={this.isActive}>
          <DropIndicatorBar isActive={this.isActive} color={dropColor} />
          <DropIndicatorMessage isActive={this.isActive} color={dropColor}>
            <div>{dropMessage}</div>
          </DropIndicatorMessage>
        </DropIndicator>
      </DropContainer>
    );
  }
}

export default DropZone;
