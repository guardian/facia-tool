import React from 'react';
import styled from 'styled-components';
import ToolTip from './HoverActionToolTip';

const HoverActionsDiv = styled('div')`
  display: flex;
  bottom: 0;
  justify-content: space-around;
`;

interface HoverButtonInterface {
  text: string;
  component: React.ComponentType<ButtonPropsForWrapper>;
}
export interface ButtonPropsForWrapper {
  showToolTip: () => void;
  hideToolTip: () => void;
}
interface WrapperProps<ButtonProps> {
  buttons: Array<HoverButtonInterface>;
  buttonprops: ButtonProps;
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

  showToolTip = () => {
    this.setState({
      isToolTipVisible: true
    });
  };

  hideToolTip = () => {
    this.setState({
      isToolTipVisible: false
    });
  };

  setToolTipText = (text: string) =>
    this.setState((prevState: WrapperState) => ({
      ...prevState,
      toolTipText: text
    }));

  render() {
    const { buttons, buttonprops } = this.props;
    const { isToolTipVisible, toolTipText } = this.state;
    return (
      <HoverActionsDiv>
        {isToolTipVisible ? <ToolTip text={toolTipText} /> : null}
        {buttons.map(ButtonObj => (
          <ButtonObj.component
            key={ButtonObj.text}
            {...buttonprops}
            showToolTip={() => {
              this.setToolTipText(ButtonObj.text);
              this.showToolTip();
            }}
            hideToolTip={() => {
              this.hideToolTip();
            }}
          />
        ))}
      </HoverActionsDiv>
    );
  }
}

export { HoverActionsButtonWrapper, HoverButtonInterface };
