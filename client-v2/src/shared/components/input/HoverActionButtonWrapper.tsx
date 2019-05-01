import React from 'react';
import { styled } from 'shared/constants/theme';
import ToolTip from './HoverActionToolTip';
import { CollectionItemSizes } from 'shared/types/Collection';

const HoverActionsWrapper = styled('div')<{
  size?: string; // Article Component size
}>`
  bottom: 0;
  position: relative;
  z-index: 10;
  /* Offset button margin spacing */
  margin: 0 -2px;
`;

const ToolTipWrapper = styled('div')<{
  size?: string; // Article Component size
  toolTipPosition: string;
  toolTipAlign: string;
}>`
  position: absolute;
  top: ${props => (props.toolTipPosition === 'bottom' ? '30px' : null)};
  left: ${props =>
    props.toolTipPosition === 'left' || props.toolTipAlign === 'left'
      ? '0px'
      : null};
  bottom: ${props => (props.toolTipPosition === 'top' ? '30px' : null)};
  right: ${props =>
    props.toolTipAlign === 'center'
      ? '-10px'
      : props.toolTipPosition === 'right' || props.toolTipAlign === 'right'
      ? '0px'
      : null};
`;

interface HoverButtonInterface {
  text: string;
  component: React.ComponentType<ButtonPropsFromWrapper>;
}
export interface ButtonPropsFromWrapper {
  showToolTip: () => void;
  hideToolTip: () => void;
}
interface WrapperProps<ButtonProps> {
  buttons: HoverButtonInterface[];
  buttonProps: ButtonProps;
  size?: CollectionItemSizes; // Article Component size
  toolTipPosition: 'top' | 'left' | 'bottom' | 'right';
  toolTipAlign: 'left' | 'center' | 'right';
}

interface WrapperState {
  isToolTipVisible: boolean;
  toolTipText: string;
}

class HoverActionsButtonWrapper<ButtonProps> extends React.Component<
  WrapperProps<ButtonProps>,
  WrapperState
> {
  constructor(props: WrapperProps<ButtonProps>) {
    super(props);
    this.state = {
      isToolTipVisible: false,
      toolTipText: ''
    };
  }

  public render() {
    const { buttons, buttonProps, toolTipPosition, toolTipAlign } = this.props;
    const { isToolTipVisible, toolTipText } = this.state;

    return (
      <HoverActionsWrapper size={this.props.size}>
        {isToolTipVisible ? (
          <ToolTipWrapper
            toolTipPosition={toolTipPosition}
            toolTipAlign={toolTipAlign}
          >
            <ToolTip text={toolTipText} />
          </ToolTipWrapper>
        ) : null}
        {buttons.map(ButtonObj => (
          <ButtonObj.component
            key={ButtonObj.text}
            {...buttonProps}
            showToolTip={() => {
              this.showToolTip(ButtonObj.text);
            }}
            hideToolTip={() => {
              this.hideToolTip();
            }}
          />
        ))}
      </HoverActionsWrapper>
    );
  }

  private showToolTip = (text: string) =>
    this.setState({
      isToolTipVisible: true,
      toolTipText: text
    });

  private hideToolTip = () => {
    this.setState({
      isToolTipVisible: false
    });
  };
}

export { HoverActionsButtonWrapper, HoverButtonInterface };
